"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Input,
  Autocomplete,
  AutocompleteItem,
  Button,
  Textarea,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/header";
import { regions } from "./regions";
import { convertImageToBase64 } from "@/components/convertImage";

type Approach = "sales" | "income" | "cost";

interface APIResponse {
  llm_predicted_value: string;
  predicted_value: number;
}

export default function FormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [approach, setApproach] = useState<Approach>("sales");
  const [lastSaleDate, setLastSaleDate] = useState("");
  const [lastSaleValue, setLastSaleValue] = useState(0);
  const [zipCode, setZipCode] = useState("");
  const [grossRent, setGrossRent] = useState(0);
  const [metro, setMetro] = useState("");
  const [imageBase64Strings, setImageBase64Strings] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [bedroom, setBedroom] = useState("");
  const [bathroom, setBathroom] = useState("");
  const [sqft, setSqft] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [fileName, setFileName] = useState("Choose a file...");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [siteValue, setSiteValue] = useState(0);
  const [dwellingPerSqft, setDwellingPerSqft] = useState(0);
  const [dwellingSqft, setDwellingSqft] = useState(0);
  const [garagePerSqft, setGaragePerSqft] = useState(0);
  const [garageSqft, setGarageSqft] = useState(0);
  const [costNew, setCostNew] = useState(0);
  const [totalDepreciation, setTotalDepreciation] = useState(0);

  useEffect(() => {
    const queryApproach = searchParams.get("approach") as Approach;
    if (queryApproach) {
      setApproach(queryApproach);
    }
  }, [searchParams]);

  const handleApiCall = async () => {
    let method = "";
    let baseURL = "http://127.0.0.1:5000";
    const body = {
      zip_code: zipCode,
      metro,
      gross_rent: grossRent,
      last_sale_date: lastSaleDate,
      last_sale_value: lastSaleValue.toString(),
      description,
      bedroom,
      bathroom,
      sqft,
      images: imageBase64Strings,
      address,
      city,
      state,
      site_value: siteValue,
      dppsqft: dwellingPerSqft,
      dsqft: dwellingSqft,
      gppsqft: garagePerSqft,
      gsqft: garageSqft,
      costNew,
      depreciation: totalDepreciation,
    };

    switch (approach) {
      case "sales":
        method = "/sales_method_value";
        break;
      case "income":
        method = "/income_method_value";
        break;
      case "cost":
        method = "/cost_method_value";
        break;
      default:
        console.error("Unknown approach");
        return;
    }

    try {
      const response = await fetch(`${baseURL}${method}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = (await response.json()) as APIResponse;
        localStorage.setItem(`${approach}`, JSON.stringify({ ...data }));
        router.push(`/pricing?approach=${approach}`);
      } else {
        console.error("Failed to fetch API data");
      }
    } catch (error) {
      console.error("Error during API call", error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log(e.target.files);
      const filesArray = Array.from(e.target.files);
      const base64Strings = await Promise.all(
        filesArray.map((file) => convertImageToBase64(file))
      );
      setFileName(`${filesArray.length}` + " files selected");
      setImageBase64Strings(base64Strings);
    } else {
      setFileName("Choose a file...");
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Header first="Fill your" second="Information" />
      <div className="flex flex-col space-y-4 w-1/3 mx-auto mb-10">
        <Input
          isClearable
          label="Property Address"
          type="text"
          placeholder="Enter the property address"
          className="w-full"
          onChange={(e) => setAddress(e.target.value)}
        />
        <Input
          isClearable
          label="City"
          type="text"
          placeholder="Enter the City"
          className="w-full"
          onChange={(e) => setCity(e.target.value)}
        />
        <Input
          isClearable
          label="State"
          type="text"
          placeholder="Enter the State, e.g. NY"
          className="w-full"
          onChange={(e) => setState(e.target.value)}
        />
        <Input
          isClearable
          label="Zipcode"
          type="text"
          placeholder="Enter the zipcode"
          className="w-full"
          onChange={(e) => setZipCode(e.target.value)}
        />
        {approach === "income" && (
          <>
            <Autocomplete
              label="Metro Region"
              placeholder="Enter the region"
              className="w-full"
              onSelectionChange={(id) => setMetro(id as string)}
            >
              {regions.map((item) => (
                <AutocompleteItem key={item.value} value={item.value}>
                  {item.label}
                </AutocompleteItem>
              ))}
            </Autocomplete>
            <Input
              label="Gross Annual Rent"
              type="number"
              placeholder="Real estate revenue - Operating expenses"
              className="w-full"
              onChange={(e) => setGrossRent(parseFloat(e.target.value))}
            />
          </>
        )}

        {approach === "cost" && (
          <>
            <Input
              isClearable
              label="Site Value"
              type="number"
              placeholder="Enter the site value"
              onChange={(e) => setSiteValue(parseFloat(e.target.value))}
            />
            <Input
              isClearable
              label="Dwelling per Sqft"
              type="number"
              placeholder="Cost per Sqft of Dwelling"
              onChange={(e) => setDwellingPerSqft(parseFloat(e.target.value))}
            />
            <Input
              isClearable
              label="Dwelling Sqft"
              type="number"
              placeholder="Total Sqft of Dwelling"
              onChange={(e) => setDwellingSqft(parseFloat(e.target.value))}
            />
            <Input
              isClearable
              label="Garage per Sqft"
              type="number"
              placeholder="Cost per Sqft of Garage"
              onChange={(e) => setGaragePerSqft(parseFloat(e.target.value))}
            />
            <Input
              isClearable
              label="Garage Sqft"
              type="number"
              placeholder="Total Sqft of Garage"
              onChange={(e) => setGarageSqft(parseFloat(e.target.value))}
            />
            <Input
              isClearable
              label="Cost New"
              type="number"
              placeholder="Total New Construction Cost"
              onChange={(e) => setCostNew(parseFloat(e.target.value))}
            />
            <Input
              isClearable
              label="Total Depreciation"
              type="number"
              placeholder="Total Depreciation"
              onChange={(e) => setTotalDepreciation(parseFloat(e.target.value))}
            />
          </>
        )}
        {approach !== "cost" && (
          <>
            <Input
              label="Number of Bedrooms"
              type="number"
              placeholder="Enter the bedroom count"
              className="w-full"
              onChange={(e) => setBedroom(e.target.value)}
            />
            <Input
              label="Number of Bathrooms"
              type="number"
              placeholder="Enter the bathroom count"
              className="w-full"
              onChange={(e) => setBathroom(e.target.value)}
            />
            <Input
              label="Sqft"
              type="number"
              placeholder="Enter the sqft"
              className="w-full"
              onChange={(e) => setSqft(e.target.value)}
            />
            <Input
              label="Last Sale Date"
              type="month"
              placeholder="Month/Year"
              className="w-full"
              onChange={(e) => setLastSaleDate(e.target.value)}
            />
            <Input
              label="Last Sale Value"
              type="number"
              placeholder="Enter the last sale value"
              className="w-full"
              onChange={(e) => setLastSaleValue(parseFloat(e.target.value))}
            />
            <Textarea
              label="Description"
              placeholder="Enter a description"
              className="w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <Button color="secondary" variant="flat" onClick={handleFileClick}>
              {fileName}
            </Button>
          </>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg py-2 px-3 rounded-lg mb-28"
          onClick={handleApiCall}
        >
          Get your results!
        </motion.button>
      </div>
    </>
  );
}
