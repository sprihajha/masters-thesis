"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { Header } from "@/components/header";
import { motion } from "framer-motion";

type Approach = "sales" | "income" | "cost";

interface APIResponse {
  [key: string]: string | number;
}

// Mapping API keys to user-friendly display names
const keyNameMap: { [key: string]: string } = {
  income_value: "Predicted Value",
  cost_value: "Predicted Value",
  sales_value: "Predicted Value",
  address: "Address",
  city: "City",
  state: "State",
  zip_code: "Zip Code",
  grm: "Gross Rent Multiplier",
  gross_rent: "Gross Annual Rent",
  income_value_description: "Description",
  value_description: "Description",
  sales_value_description: "Description",
  bathroom: "Number of Bathrooms",
  bedroom: "Number of Bedrooms",
  ppsqft: "Price Per Sq Ft",
  sqft: "Total Sq Ft",
  dppsqft: "Dwelling Per Sq Ft",
  gppsqft: "Garage Per Sq Ft",
  site_value: "Site Value",
  cost_new: "Cost New",
  depreciation: "Total Depreciation",
};

export default function PricePage() {
  const searchParams = useSearchParams();
  const [approach, setApproach] = useState<Approach | null>(null);
  const [data, setData] = useState<APIResponse | null>(null);

  useEffect(() => {
    const queryApproach = searchParams.get("approach") as Approach;
    if (queryApproach) {
      setApproach(queryApproach);
      const storedData = localStorage.getItem(`${approach}`);
      if (storedData) {
        console.log("Data fetched from local storage.", storedData);
        setData(JSON.parse(storedData));
      }
    }
  }, [searchParams, approach]);

  const handleDownload = async () => {
    let url = "";
    let baseURL = "http://ec2-18-206-88-15.compute-1.amazonaws.com:8080/";

    switch (approach) {
      case "sales":
        url = "/sales_comparison_value_fill_pdf";
        break;
      case "income":
        url = "/income_method_value_fill_pdf";
        break;
      case "cost":
        url = "/cost_method_value_fill_pdf";
        break;
      default:
        console.error("Unknown approach");
        return;
    }

    try {
      const response = await fetch(`${baseURL}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/pdf",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const blob: Blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link: HTMLAnchorElement = document.createElement("a");
        link.href = objectUrl;
        link.download = `${approach}` + "appraisal.pdf";
        window.open(link.href, "_blank");
        link.click();
        URL.revokeObjectURL(objectUrl);
      } else {
        console.error("Failed to fetch API data");
      }
    } catch (error) {
      console.error("Error during API call", error);
    }
  };

  return (
    <Suspense>
      <Header first="Review your" second="Pricing" />
      <div>
        {data ? (
          <Table aria-label="API Response Data" className="h-[600px] w-[600px]">
            <TableHeader>
              <TableColumn>KEY</TableColumn>
              <TableColumn>VALUE</TableColumn>
            </TableHeader>
            <TableBody>
              {Object.entries(data).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>{keyNameMap[key] || key}</TableCell>
                  <TableCell>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <h3>No data available.</h3>
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg py-2 px-3 rounded-lg mb-28"
        onClick={handleDownload}
      >
        Download your report!
      </motion.button>
    </Suspense>
  );
}
