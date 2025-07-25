"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import { Transition } from "@headlessui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TestimonialsGridWithCenteredCarousel() {
  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-20 overflow-hidden h-full bg-background">
      <div className="pb-20">
        <h1 className="pt-4 font-bold text-foreground text-lg md:text-2xl">
          Trusted by Leading Research Teams
        </h1>
        <p className="text-base text-muted-foreground">
          Molecular analysis and protein research teams rely on our platform to accelerate their discoveries.
        </p>
      </div>

      <div className=" relative">
        <TestimonialsSlider />
        <div className="h-full max-h-screen md:max-h-none overflow-hidden w-full bg-background/50 opacity-30 [mask-image:radial-gradient(circle_at_center,transparent_10%,white_99%)]">
          <TestimonialsGrid />
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-40 w-full bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
}

export const TestimonialsGrid = () => {
  const first = portfolioScreenshots.slice(0, 3);
  const second = portfolioScreenshots.slice(3, 6);
  const third = portfolioScreenshots.slice(6, 9);
  const fourth = portfolioScreenshots.slice(9, 12);

  const grid = [first, second, third, fourth];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
      {grid.map((screenshotsCol, index) => (
        <div key={`screenshots-col-${index}`} className="grid gap-4">
          {screenshotsCol.map((screenshot) => (
            <Card key={`screenshot-${screenshot.title}-${index}`}>
              <div className="relative mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-chart-2/20 p-4">
                <div className="text-xs text-accent font-mono mb-2">{screenshot.category}</div>
                <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-chart-2/10 rounded border border-accent/20 relative overflow-hidden">
                  {screenshot.visualization}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                </div>
              </div>
              <Quote>{screenshot.description}</Quote>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "p-6 rounded-xl border border-accent/20 bg-background/40 backdrop-blur-sm shadow-[0_0_20px_rgba(0,255,209,0.1)] relative group hover:shadow-[0_0_30px_rgba(0,255,209,0.2)] transition-all duration-300",
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-primary/5 before:to-chart-2/5 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        className
      )}
    >
      {children}
    </div>
  );
};

export const Quote = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h3
      className={cn(
        "text-xs font-semibold text-foreground py-2",
        className
      )}
    >
      {children}
    </h3>
  );
};

export const QuoteDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={cn(
        "text-xs font-normal text-muted-foreground max-w-sm",
        className
      )}
    >
      {children}
    </p>
  );
};

interface PortfolioItem {
  title: string;
  category: string;
  description: string;
  visualization: React.ReactNode;
}

export const portfolioScreenshots: PortfolioItem[] = [
  {
    title: "Molecular Dashboard",
    category: "MOLECULAR ANALYSIS",
    description: "Real-time molecular structure analysis with predictive modeling",
    visualization: (
      <div className="flex items-center justify-center h-full">
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-accent/30 rounded-full animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
          ))}
        </div>
      </div>
    )
  },
  {
    title: "Protein Structure",
    category: "PROTEIN RESEARCH",
    description: "3D protein folding visualization with interactive controls",
    visualization: (
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-primary/40 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-2 border-accent/40 rounded-full animate-ping"></div>
        </div>
      </div>
    )
  },
  {
    title: "Data Analytics",
    category: "RESEARCH INSIGHTS",
    description: "Advanced analytics dashboard for research data visualization",
    visualization: (
      <div className="flex items-center justify-center h-full space-x-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`w-1 bg-gradient-to-t from-primary to-accent rounded-t`} style={{height: `${(i + 1) * 6}px`}} />
        ))}
      </div>
    )
  },
];

interface Testimonial {
  src: string;
  quote: string;
  name: string;
  designation?: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Dr. Nourah Alharbi",
    quote:
      "This platform has revolutionized our protein folding research. The molecular analysis tools provide insights we never thought possible in such detail and speed.",
    src: "https://i.pravatar.cc/150?img=1",
    designation: "Lead Protein Researcher, BioTech Institute",
  },
  {
    name: "Dr. Ampi Taring",
    quote:
      "The data visualization capabilities are exceptional. Our team can now identify molecular patterns and correlations that were previously hidden in complex datasets.",
    src: "https://i.pravatar.cc/150?img=2",
    designation: "Senior Research Scientist, Molecular Dynamics Lab",
  },
  {
    name: "Dr. Sanjib Kumar Das",
    quote:
      "The integration of AI-driven analysis with our existing research workflows has accelerated our drug discovery process by months. Absolutely transformative technology.",
    src: "https://i.pravatar.cc/150?img=3",
    designation: "Principal Investigator, Pharmaceutical Research Division",
  },
];

export const TestimonialsSlider = () => {
  const [active, setActive] = useState<number>(0);
  const [autorotate, setAutorotate] = useState<boolean>(true);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const slicedTestimonials = testimonials.slice(0, 3);

  useEffect(() => {
    if (!autorotate) return;
    const interval = setInterval(() => {
      setActive(
        active + 1 === slicedTestimonials.length ? 0 : (active) => active + 1
      );
    }, 7000);
    return () => clearInterval(interval);
  }, [active, autorotate, slicedTestimonials.length]);

  const heightFix = () => {
    if (testimonialsRef.current && testimonialsRef.current.parentElement)
      testimonialsRef.current.parentElement.style.height = `${testimonialsRef.current.clientHeight}px`;
  };

  useEffect(() => {
    heightFix();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        heightFix();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <section className="absolute inset-0 mt-20 md:mt-60">
      <div className="max-w-3xl mx-auto relative z-40 h-80">
        <div className="relative pb-12 md:pb-20">
          {/* Navigation arrows */}
          <div className="absolute top-16 left-0 right-0 flex justify-between items-center px-4 z-50">
            <button
              onClick={() => {
                const newActive = active === 0 ? slicedTestimonials.length - 1 : active - 1;
                setActive(newActive);
                setAutorotate(false);
              }}
              className="p-2 rounded-full bg-gradient-to-r from-primary to-chart-2 hover:shadow-[0_0_20px_rgba(0,164,255,0.5)] transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => {
                const newActive = active + 1 === slicedTestimonials.length ? 0 : active + 1;
                setActive(newActive);
                setAutorotate(false);
              }}
              className="p-2 rounded-full bg-gradient-to-r from-primary to-chart-2 hover:shadow-[0_0_20px_rgba(0,164,255,0.5)] transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Carousel */}
          <div className="text-center">
            {/* Testimonial image */}
            <div className="relative h-40 [mask-image:_linear-gradient(0deg,transparent,#FFFFFF_30%,#FFFFFF)] md:[mask-image:_linear-gradient(0deg,transparent,#FFFFFF_40%,#FFFFFF)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[480px] -z-10 pointer-events-none before:rounded-full rounded-full before:absolute before:inset-0 before:bg-gradient-to-b before:from-accent/20 before:to-transparent before:to-20% after:rounded-full after:absolute after:inset-0 after:bg-background after:m-px before:-z-20 after:-z-20">
                {slicedTestimonials.map((item, index) => (
                  <Transition
                    as="div"
                    key={index}
                    show={active === index}
                    enter="transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] duration-700 order-first"
                    enterFrom="opacity-0 -translate-x-10"
                    enterTo="opacity-100 translate-x-0"
                    leave="transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] duration-700"
                    leaveFrom="opacity-100 translate-x-0"
                    leaveTo="opacity-0 translate-x-10"
                    beforeEnter={() => heightFix()}
                  >
                    <div className="absolute inset-0 h-full -z-10">
                      <Image
                        className="relative top-11 left-1/2 -translate-x-1/2 rounded-full border-2 border-accent/50 shadow-[0_0_20px_rgba(0,255,209,0.3)]"
                        src={item.src}
                        width={56}
                        height={56}
                        alt={item.name}
                      />
                    </div>
                  </Transition>
                ))}
              </div>
            </div>
            {/* Text */}
            <div className="mb-10 transition-all duration-150 delay-300 ease-in-out px-8 sm:px-6">
              <div className="relative flex flex-col" ref={testimonialsRef}>
                {slicedTestimonials.map((item, index) => (
                  <Transition
                    as="div"
                    key={index}
                    show={active === index}
                    enter="transition ease-in-out duration-500 delay-200 order-first"
                    enterFrom="opacity-0 -translate-x-4"
                    enterTo="opacity-100 translate-x-0"
                    leave="transition ease-out duration-300 delay-300 absolute"
                    leaveFrom="opacity-100 translate-x-0"
                    leaveTo="opacity-0 translate-x-4"
                    beforeEnter={() => heightFix()}
                  >
                    <div className="text-base text-foreground md:text-xl font-bold">
                      {item.quote}
                    </div>
                  </Transition>
                ))}
              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-wrap justify-center -m-1.5 px-8 sm:px-6">
              {slicedTestimonials.map((item, index) => (
                <button
                  className={cn(
                    `px-3 py-2 rounded-full m-1.5 text-xs border transition duration-300 ease-in-out relative overflow-hidden group`,
                    active === index
                      ? "border-accent/50 bg-gradient-to-r from-primary/20 to-chart-2/20 shadow-[0_0_15px_rgba(0,255,209,0.2)]"
                      : "border-border/30 bg-background/50 opacity-70 hover:opacity-100"
                  )}
                  key={index}
                  onClick={() => {
                    setActive(index);
                    setAutorotate(false);
                  }}
                >
                  <span className="relative z-10">
                    <span className={cn("font-bold", active === index ? "text-accent" : "text-foreground")}>
                      {item.name}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
