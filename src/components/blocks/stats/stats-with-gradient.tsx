"use client";
import { cn } from "@/lib/utils";
import React from "react";

export function StatsWithGradient() {
  const items = [
    {
      description: "Simulations Analyzed",
      value: "10M+",
    },
    {
      description: "Research Teams", 
      value: "500+",
    },
    {
      description: "Uptime",
      value: "99.9%",
    },
    {
      description: "Support",
      value: "24/7",
    },
  ];
  return (
    <section className="group/container relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-[#0A0F17] p-10 py-20">
      <div className="relative z-20">
        <h2 className="text-center text-xl font-bold text-white font-[var(--font-display)] md:text-3xl">
          Trusted by research teams worldwide
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-[#64748B] font-[var(--font-body)] md:text-base">
          We provide cutting-edge simulation analysis tools that help
          teams accelerate their research with confidence and precision.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={"card" + index}
              className={cn(
                "group/card relative overflow-hidden rounded-xl bg-[#0A0F17] border border-[#64748B]/20 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#00A4FF]/20 hover:border-[#00FFD1]/30"
              )}
            >
              <div className="flex items-center gap-2">
                <p className="text-4xl font-bold font-[var(--font-display)] bg-gradient-to-r from-[#00A4FF] to-[#6B00FF] bg-clip-text text-transparent">
                  {item.value}
                </p>
              </div>
              <p className="mt-4 text-base text-[#64748B] font-[var(--font-body)] group-hover/card:text-white transition-colors duration-300">
                {item.description}
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FFD1]/5 to-[#00A4FF]/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
