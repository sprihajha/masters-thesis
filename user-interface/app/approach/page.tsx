"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardFooter, Image } from "@nextui-org/react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { Header } from "@/components/header";

// Define a type for the approach details
type ApproachDetail = {
  key: "sales" | "income" | "cost";
  label: string;
  imageSrc: string;
};

const approaches: ApproachDetail[] = [
  { key: "income", label: "Income Approach", imageSrc: "/income.jpg" },
  { key: "sales", label: "Sales Comparison Approach", imageSrc: "/sales.jpg" },
  { key: "cost", label: "Cost Approach", imageSrc: "/cost.jpg" },
];

export default function AboutPage() {
  const router = useRouter();

  const navigateToForm = (approach: string) => {
    router.push(`/form?approach=${encodeURIComponent(approach)}`);
  };

  return (
    <>
      <Header first="Choose your" second="Approach" />
      <div className="flex flex-row gap-20 mt-20">
        {approaches.map(({ key, label, imageSrc }) => (
          <Card
            key={key}
            isFooterBlurred
            radius="lg"
            className="border-none shadow-2xl shadow-indigo-500/50"
          >
            <Image
              alt={label}
              src={imageSrc}
              className="object-cover"
              height={300}
              width={300}
            />
            <CardFooter className="absolute bg-white/50 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
              <p className="text-md font-bold text-black/80">{label}</p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg py-2 px-3 rounded-lg"
                onClick={() => navigateToForm(key)}
              >
                <ArrowRightIcon className="h-6 w-6" />
              </motion.button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
