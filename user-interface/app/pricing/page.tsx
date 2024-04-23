"use client";
import { Header } from "@/components/header";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Card, CardFooter } from "@nextui-org/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Define a type for the approach details
type PriceDetail = {
  key: "sales" | "income" | "cost";
  cost: number;
};

const prices: PriceDetail[] = [
  { key: "income", cost: 0 },
  { key: "sales", cost: 0 },
  { key: "cost", cost: 0 },
];

export default function PricePage() {
  const router = useRouter();

  return (
    <>
      <Header first="Review your" second="Prices" />
      <div className="flex flex-row gap-20 mt-20">
        {prices.map(({ key }) => (
          <Card
            key={key}
            isFooterBlurred
            radius="lg"
            className="border-none shadow-2xl shadow-indigo-500 bg-white h-72 w-72"
          ></Card>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg mt-20 py-3 px-8 rounded-lg"
        onClick={() => router.push("/report")}
      >
        <ArrowRightIcon className="h-6 w-6" />
      </motion.button>
    </>
  );
}
