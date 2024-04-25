"use client";
import React from "react";
import { title, subtitle } from "@/components/primitives";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center h-screen">
      <div className="inline-block max-w-full text-center justify-center">
        <h1 className={title({ size: "xxl" })}>Crafting&nbsp;</h1>
        <h1
          className={title({
            color: "violet",
            size: "xxl",
            class:
              "text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
          })}
        >
          Appraisals&nbsp;
        </h1>
        <br />
        <h1 className={title({ size: "xl" })}>
          for Lenders and Clients Alike.
        </h1>
        <h2 className={subtitle({ class: "mt-4" })}>
          Elevate appraisals with streamlined, accurate market analysis.
        </h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg mt-20 py-3 px-8 rounded-lg"
          onClick={() => router.push("/approach")}
        >
          <ArrowRightIcon className="h-6 w-6" />
        </motion.button>
      </div>
    </section>
  );
}
