"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { title } from "@/components/primitives";
import { motion } from "framer-motion";

type Approach = "sales" | "income" | "cost";

export default function FormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [approach, setApproach] = useState<Approach>("sales");

  useEffect(() => {
    const queryApproach = searchParams.get("approach") as Approach;
    if (queryApproach) {
      setApproach(queryApproach);
    }
  }, [searchParams]);

  return (
    <>
      <div className="flex flex-row mb-10">
        <h1 className={title({ size: "xl" })}>Fill your&nbsp;</h1>
        <h1
          className={title({
            color: "violet",
            size: "xl",
            class:
              "text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
          })}
        >
          Information&nbsp;
        </h1>
        <br />
      </div>
      <div className="space-y-4 max-w-md mx-auto mt-10">
        {/* Adjusted input type to "month" */}
        <Input
          isClearable
          label="Last Sale Date"
          type="month"
          placeholder="Month/Year"
          className="w-full"
          onChange={(e) => console.log(e.target.value)} // Add handling for change event as needed
        />
        <Input
          isClearable
          label="Last Sale Value"
          type="number"
          placeholder="Enter the last sale value"
          className="w-full"
          onChange={(e) => console.log(e.target.value)} // Add handling for change event as needed
        />
        {approach === "sales" && (
          <Input
            isClearable
            label="Zipcode"
            type="text"
            placeholder="Enter the zipcode"
            className="w-full"
            onChange={(e) => console.log(e.target.value)} // Add handling for change event as needed
          />
        )}
        {approach === "income" && (
          <Input
            isClearable
            label="Metro Region"
            type="text"
            placeholder="Enter the metro region"
            className="w-full"
            onChange={(e) => console.log(e.target.value)} // Add handling for change event as needed
          />
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg py-2 px-3 rounded-lg"
          onClick={() => router.push(`/pricing`)}
        >
          Get your results!
        </motion.button>
      </div>
    </>
  );
}
