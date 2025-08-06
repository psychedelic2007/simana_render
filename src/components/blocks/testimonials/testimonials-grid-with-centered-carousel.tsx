"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { ExternalLink } from "lucide-react";

export function TestimonialsGridWithCenteredCarousel() {
  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-20 overflow-hidden h-full bg-background">
      <div className="pb-20">
        <h1 className="pt-4 font-bold text-foreground text-lg md:text-2xl">
          Please cite the following work:
        </h1>
        <div className="mt-6 p-6 rounded-lg bg-gradient-to-br from-primary/10 to-chart-2/10 border border-accent/20">
          <h2 className="text-lg font-bold text-foreground mb-2">
            "<em>Bacopa monnieri</em> phytochemicals as promising BACE1 inhibitors for Alzheimer's disease therapy"
          </h2>
          <p className="text-base text-muted-foreground mb-2">
            Sangeet S, Khan A
          </p>
          <p className="text-base text-muted-foreground mb-3">
            Scientific Reports (2025)
          </p>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">DOI:</span>
            <a 
              href="https://doi.org/10.1038/s41598-025-92644-y" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 underline flex items-center gap-1 transition-colors duration-200"
            >
              10.1038/s41598-025-92644-y
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestimonialsGridWithCenteredCarousel;
