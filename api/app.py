import pandas as pd
from flask import Flask, request, jsonify, send_file
from dotenv import load_dotenv
from flask_cors import CORS
from urllib.parse import unquote
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI
import requests
import os
import PyPDF2
import io

# Load environment variables from .env file
load_dotenv()

model = ChatOpenAI(model="gpt-4", temperature=0)


# Define your desired data structure.
class Appraisal(BaseModel):
    description: str = Field(
        description="Brief description of reason for the difference in cost"
    )
    cost: str = Field(description="only the predicted cost of the house")


# Set up a parser + inject instructions into the prompt template.
parser = JsonOutputParser(pydantic_object=Appraisal)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\nWe are given that the average cost of single family homes in this area are ${average_cost}and that the average single family homes in the US have 3 bedrooms, 3 bathrooms and are 2300 sqft. Guess the cost of this {bedroom} bedroom, {bathroom} bathroom {sqft} sqft house given the following description in it's listing and the description of the images in the listing.\n\nDescription:\n{description}\n\nImage Descriptions:\n{image_descriptions}\n\nMention the brief reason for the cost difference and the just the predicted cost strictly in the JSON format specified above.",
    input_variables=[
        "description",
        "average_cost",
        "bedroom",
        "bathroom",
        "sqft",
        "image_descriptions",
    ],
    partial_variables={
        "format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

app = Flask(__name__)
CORS(app)

zhvi_file_path = "./Zip_zhvi.csv"
zhvi_metro_file_path = "./Metro_zhvi.csv"
zori_file_path = "./Metro_zori.csv"

# Load the dataset into a pandas DataFrame
zhvi_data = pd.read_csv(zhvi_file_path)
zhvi_metro_data = pd.read_csv(zhvi_metro_file_path)
zori_data = pd.read_csv(zori_file_path)

# Get the date column names
zhvi_date_columns = zhvi_data.columns[9:]
zhvi_metro_date_columns = zhvi_metro_data.columns[5:]
zori_date_columns = zori_data.columns[5:]

# Format the date column names to "YYYY-MM"
zhvi_formatted_date_columns = [
    pd.to_datetime(date, format="%Y-%m-%d").strftime("%Y-%m")
    for date in zhvi_date_columns
]
zhvi_metro_formatted_date_columns = [
    pd.to_datetime(date, format="%Y-%m-%d").strftime("%Y-%m")
    for date in zhvi_metro_date_columns
]
zori_formatted_date_columns = [
    pd.to_datetime(date, format="%Y-%m-%d").strftime("%Y-%m")
    for date in zori_date_columns
]

# Update the DataFrame column names
zhvi_data.columns = zhvi_data.columns[:9].tolist(
) + zhvi_formatted_date_columns
zhvi_metro_data.columns = (
    zhvi_metro_data.columns[:5].tolist() + zhvi_metro_formatted_date_columns
)
zori_data.columns = zori_data.columns[:5].tolist(
) + zori_formatted_date_columns


def describe_image(base64_image):
    openai_key = os.getenv("OPENAI_API_KEY")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai_key}",
    }
    payload = {
        "model": "gpt-4-turbo",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "What’s in this image?"},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ],
        "max_tokens": 4096,
    }
    response = requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=payload
    )
    description = response.json()["choices"][0]["message"]["content"]
    return description


def describe_images(images):
    descriptions = ""
    i = 1
    for image in images:
        description = describe_image(image)
        descriptions += f"Image {i}:\n{description}\n\n"
        i += 1
    return descriptions


def sales_comparison_value(
    zip_code,
    last_sale_date,
    last_sale_value,
    description,
    bedroom,
    bathroom,
    sqft,
    images,
):
    # Filter the ZHVI data for the specific zip code
    zip_data = zhvi_data[zhvi_data["RegionName"] == zip_code]

    # Get the ZHVI value for the last sale date
    last_sale_zhvi = zip_data[last_sale_date].values[0]

    # Get the latest ZHVI value
    latest_zhvi = zip_data.iloc[:, -1].values[0]

    # Calculate the percentage change from the last sale value to the latest ZHVI value
    percentage_change = (latest_zhvi - last_sale_zhvi) / last_sale_zhvi * 100

    # Predict the current house value
    predicted_value = last_sale_value * (1 + percentage_change / 100)

    property_data = chain.invoke(
        {
            "description": description,
            "average_cost": str(int(predicted_value)),
            "bedroom": str(bedroom),
            "bathroom": str(bathroom),
            "sqft": str(sqft),
            "image_descriptions": describe_images(images),
        }
    )

    predicted_value = int(
        property_data["cost"].replace("$", "").replace(",", ""))
    value_description = property_data["description"]

    return predicted_value, value_description


def predict_house_value_zhvi_metro(metro, last_sale_date, last_sale_value):
    # Filter the ZHVI data for the specific metro
    metro_data = zhvi_metro_data[zhvi_metro_data["RegionName"] == metro]

    # Get the ZHVI value for the last sale date
    last_sale_zhvi_metro = metro_data[last_sale_date].values[0]

    # Get the latest ZHVI value
    latest_zhvi_metro = metro_data.iloc[:, -1].values[0]

    # Calculate the percentage change from the last sale value to the latest ZHVI value
    percentage_change = (
        (latest_zhvi_metro - last_sale_zhvi_metro) / last_sale_zhvi_metro * 100
    )

    # Predict the current house value
    predicted_value = last_sale_value * (1 + percentage_change / 100)

    return predicted_value


def predict_rent_value(metro):
    # Filter the ZORI data for the specific metro region
    metro_data = zori_data[zori_data["RegionName"] == metro]

    # Get the latest ZORI value
    latest_zori = metro_data.iloc[:, -1].values[0]

    return latest_zori


def income_method_value(
    metro,
    gross_rent,
    last_sale_date,
    last_sale_value,
    description,
    bedroom,
    bathroom,
    sqft,
    images,
):
    predicted_house_value_metro = predict_house_value_zhvi_metro(
        metro, last_sale_date, last_sale_value
    )
    predicted_rent_value = predict_rent_value(metro)

    property_data = chain.invoke(
        {
            "description": description,
            "average_cost": str(int(predicted_house_value_metro)),
            "bedroom": str(bedroom),
            "bathroom": str(bathroom),
            "sqft": str(sqft),
            "image_descriptions": describe_images(images),
        }
    )

    llm_predicted_value = float(
        property_data["cost"].replace("$", "").replace(",", ""))

    grm = llm_predicted_value / (predicted_rent_value * 12)

    predicted_value = int(gross_rent * grm)

    value_description = property_data["description"]

    return predicted_value, grm, value_description


def fill_pdf(input_pdf_path, data):
    # Load the PDF file
    with open(input_pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        writer = PyPDF2.PdfWriter()
        print(reader.get_form_text_fields())
        writer.append_pages_from_reader(reader)

        for i in range(0, 3):
            # Get the first page
            page = writer.pages[i]

            # Fill the form fields
            for key, value in data.items():
                writer.update_page_form_field_values(page, {key: str(value)})

        # Write out the filled PDF to a temporary file
        output_pdf = io.BytesIO()
        writer.write(output_pdf)
        output_pdf.seek(0)
        return output_pdf


@app.route("/sales_comparison_value", methods=["POST"])
def get_sales_comparison_value():
    # Retrieve JSON data from the request body
    data = request.get_json()
    address = data.get("address")
    city = data.get("city")
    state = data.get("state")
    zip_code = data.get("zip_code")
    last_sale_date = data.get("last_sale_date")
    last_sale_value = data.get("last_sale_value")
    description = data.get("description")
    bedroom = data.get("bedroom")
    bathroom = data.get("bathroom")
    sqft = data.get("sqft")
    images = data.get("images")

    # Check for missing parameters before processing
    if not all(
        [
            address,
            city,
            state,
            zip_code,
            last_sale_date,
            last_sale_value,
            description,
            bedroom,
            bathroom,
            sqft,
            images,
        ]
    ):
        return jsonify({"error": "Missing required parameters"}), 400

    # Process and convert parameters after confirming they are present
    try:
        zip_code = int(zip_code)
        last_sale_value = float(last_sale_value)
        predicted_value, value_description = sales_comparison_value(
            zip_code,
            last_sale_date,
            last_sale_value,
            description,
            bedroom,
            bathroom,
            sqft,
            images,
        )
        sppsqft = round((last_sale_value / int(sqft)), 2)
        return jsonify(
            {
                "address": address,
                "city": city,
                "state": state,
                "zip_code": str(zip_code),
                "sqft": str(sqft),
                "last_sale_value": str(int(last_sale_value)),
                "bedroom": str(bedroom),
                "bathroom": str(bathroom),
                "sppsqft": str(sppsqft),
                "sales_value": str(predicted_value),
                "sales_value_description": value_description,
            }
        )
    except ValueError as e:
        # Handle specific conversion errors if input is not valid
        return jsonify({"error": f"Invalid input: {e}"}), 400
    except Exception as e:
        # Handle any other exceptions that may occur
        return jsonify({"error": str(e)}), 500


@app.route("/income_method_value", methods=["POST"])
def get_income_method_value():
    # Retrieve JSON data from the request body
    data = request.get_json()
    address = data.get("address")
    city = data.get("city")
    state = data.get("state")
    zip_code = data.get("zip_code")
    metro = data.get("metro")
    gross_rent = data.get("gross_rent")
    last_sale_date = data.get("last_sale_date")
    last_sale_value = data.get("last_sale_value")
    description = data.get("description")
    bedroom = data.get("bedroom")
    bathroom = data.get("bathroom")
    sqft = data.get("sqft")
    images = data.get("images")

    # Check for missing parameters before processing
    if not all(
        [
            address,
            city,
            state,
            zip_code,
            metro,
            gross_rent,
            last_sale_date,
            last_sale_value,
            description,
            bedroom,
            bathroom,
            sqft,
            images,
        ]
    ):
        return jsonify({"error": "Missing required parameters"}), 400

    # Process and convert parameters after confirming they are present
    try:
        metro = unquote(metro)
        gross_rent = float(gross_rent)
        last_sale_value = float(last_sale_value)
        predicted_value, grm, value_description = income_method_value(
            metro,
            gross_rent,
            last_sale_date,
            last_sale_value,
            description,
            bedroom,
            bathroom,
            sqft,
            images,
        )
        return jsonify(
            {
                "address": address,
                "city": city,
                "state": state,
                "zip_code": str(zip_code),
                "gross_rent": str(int(gross_rent)),
                "income_value": str(predicted_value),
                "grm": str(round(grm, 2)),
                "income_value_description": value_description,
            }
        )
    except ValueError as e:
        # Handle specific conversion errors if input is not valid
        return jsonify({"error": f"Invalid input: {e}"}), 400
    except Exception as e:
        # Handle any other exceptions that may occur
        return jsonify({"error": str(e)}), 500


@app.route("/cost_method_value", methods=["POST"])
def get_cost_method_value():
    # Retrieve JSON data from the request body
    data = request.get_json()
    address = data.get("address")
    city = data.get("city")
    state = data.get("state")
    zip_code = data.get("zip_code")
    site_value = data.get("site_value")
    dppsqft = data.get("dppsqft")
    gppsqft = data.get("gppsqft")
    dsqft = data.get("dsqft")
    gsqft = data.get("gsqft")
    depreciation = data.get("depreciation")

    # Check for missing parameters before processing
    if not all(
        [
            address,
            city,
            state,
            zip_code,
            site_value,
            dppsqft,
            gppsqft,
            dsqft,
            gsqft,
            depreciation,
        ]
    ):
        return jsonify({"error": "Missing required parameters"}), 400
    try:
        site_value = float(site_value)
        dppsqft = float(dppsqft)
        gppsqft = float(gppsqft)
        dsqft = float(dsqft)
        gsqft = float(gsqft)
        depreciation = float(depreciation)

        cost_new = (dppsqft * dsqft) + (gppsqft * gsqft)

        value = site_value + cost_new - depreciation

        return jsonify(
            {
                "address": address,
                "city": city,
                "state": state,
                "zip_code": str(zip_code),
                "site_value": str(int(site_value)),
                "dppsqft": str(int(dppsqft)),
                "gppsqft": str(int(gppsqft)),
                "cost_new": str(int(cost_new)),
                "depreciation": str(int(depreciation)),
                "cost_value": str(int(value)),
            }
        )

    except ValueError as e:
        # Handle specific conversion errors if input is not valid
        return jsonify({"error": f"Invalid input: {e}"}), 400
    except Exception as e:
        # Handle any other exceptions that may occur
        return jsonify({"error": str(e)}), 500


@app.route("/income_method_value_fill_pdf", methods=["POST"])
def income_method_value_fill_pdf():
    data = request.get_json()
    output_pdf = fill_pdf("./1004_fillable.pdf", data)
    return send_file(
        output_pdf, download_name="filled_income_method.pdf", as_attachment=True
    )


@app.route("/cost_method_value_fill_pdf", methods=["POST"])
def cost_method_value_fill_pdf():
    data = request.get_json()
    output_pdf = fill_pdf("./1004_fillable.pdf", data)
    return send_file(
        output_pdf, download_name="filled_cost_method.pdf", as_attachment=True
    )


@app.route("/sales_comparison_value_fill_pdf", methods=["POST"])
def sales_comparison_value_fill_pdf():
    data = request.get_json()
    output_pdf = fill_pdf("./1004_fillable.pdf", data)
    return send_file(
        output_pdf, download_name="filled_sales_comparison.pdf", as_attachment=True
    )


if __name__ == "__main__":
    app.run(debug=True)
