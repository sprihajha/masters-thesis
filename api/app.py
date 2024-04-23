import pandas as pd
from flask import Flask, request, jsonify
from urllib.parse import unquote

app = Flask(__name__)

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
zhvi_data.columns = zhvi_data.columns[:9].tolist() + zhvi_formatted_date_columns
zhvi_metro_data.columns = (
    zhvi_metro_data.columns[:5].tolist() + zhvi_metro_formatted_date_columns
)
zori_data.columns = zori_data.columns[:5].tolist() + zori_formatted_date_columns


def sales_comparison_value(zip_code, last_sale_date, last_sale_value):
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

    return predicted_value


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


def income_method_value(metro, gross_rent, last_sale_date, last_sale_value):
    predicted_house_value_metro = predict_house_value_zhvi_metro(
        metro, last_sale_date, last_sale_value
    )
    predicted_rent_value = predict_rent_value(metro)
    grm = predicted_house_value_metro / (predicted_rent_value * 12)

    predicted_value = gross_rent * grm
    return predicted_value


# zip_code = 11787
# metro = "New York, NY"
# last_sale_date = "2019-12"
# last_sale_value = 529360
# gross_rent = 3800 * 12


@app.route("/sales_comparison_value", methods=["GET"])
def get_sales_comparison_value():
    # Retrieve parameters
    zip_code = request.args.get("zip_code")
    last_sale_date = request.args.get("last_sale_date")
    last_sale_value = request.args.get("last_sale_value")

    # Check for missing parameters before processing
    if not all([zip_code, last_sale_date, last_sale_value]):
        return jsonify({"error": "Missing required parameters"}), 400

    # Process and convert parameters after confirming they are present
    try:
        zip_code = int(zip_code)
        last_sale_value = float(last_sale_value)
        predicted_value = sales_comparison_value(
            zip_code, last_sale_date, last_sale_value
        )
        return jsonify({"predicted_value": predicted_value})
    except ValueError as e:
        # Handle specific conversion errors if input is not valid
        return jsonify({"error": f"Invalid input: {e}"}), 400
    except Exception as e:
        # Handle any other exceptions that may occur
        return jsonify({"error": str(e)}), 500


@app.route("/income_method_value", methods=["GET"])
def get_income_method_value():
    # Retrieve parameters
    metro = request.args.get("metro")
    gross_rent = request.args.get("gross_rent")
    last_sale_date = request.args.get("last_sale_date")
    last_sale_value = request.args.get("last_sale_value")

    # Check for missing parameters before processing
    if not all([metro, gross_rent, last_sale_date, last_sale_value]):
        return jsonify({"error": "Missing required parameters"}), 400

    # Process and convert parameters after confirming they are present
    try:
        metro = unquote(metro)
        gross_rent = float(gross_rent)
        last_sale_value = float(last_sale_value)
        predicted_value = income_method_value(
            metro, gross_rent, last_sale_date, last_sale_value
        )
        return jsonify({"predicted_value": predicted_value})
    except ValueError as e:
        # Handle specific conversion errors if input is not valid
        return jsonify({"error": f"Invalid input: {e}"}), 400
    except Exception as e:
        # Handle any other exceptions that may occur
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
