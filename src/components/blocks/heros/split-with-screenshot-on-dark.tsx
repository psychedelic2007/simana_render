"use client"

import { ChevronDown } from "lucide-react"

export default function SplitWithScreenshotOnDark() {
  return (
    <div className="relative isolate overflow-hidden" style={{ backgroundColor: '#0A0F17' }}>
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-white/10"
      >
        <defs>
          <pattern
            x="50%"
            y={-1}
            id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
            width={200}
            height={200}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y={-1} className="overflow-visible fill-gray-800/20">
          <path
            d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
            strokeWidth={0}
          />
        </svg>
        <rect fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)" width="100%" height="100%" strokeWidth={0} />
      </svg>
      <div
        aria-hidden="true"
        className="absolute top-10 left-[calc(50%-4rem)] -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:top-[calc(50%-30rem)] lg:left-48 xl:left-[calc(50%-24rem)]"
      >
        <div
          style={{
            clipPath:
              'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
          }}
          className="aspect-1108/632 w-277 bg-gradient-to-r from-[#00A4FF] to-[#6B00FF] opacity-20"
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 pt-32 pb-24 sm:pb-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <img
            alt="MolecularDynamics"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
            className="h-11 mx-auto"
          />
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full px-3 py-1 text-sm/6 font-[var(--font-display)] font-semibold ring-1 ring-inset" style={{ backgroundColor: 'rgba(0, 164, 255, 0.1)', color: '#00FFD1', borderColor: 'rgba(0, 255, 209, 0.2)' }}>
                What's new
              </span>
              <span className="inline-flex items-center space-x-2 text-sm/6 font-[var(--font-display)] font-medium text-white">
                <span>Advanced Analysis Suite v2.0</span>
                <ChevronDown aria-hidden="true" className="size-5 text-gray-500 rotate-[-90deg]" />
              </span>
            </a>
          </div>
          <h1 className="mt-10 text-5xl font-[var(--font-display)] font-semibold tracking-tight text-pretty text-white sm:text-7xl">
            Accelerate Your Molecular Dynamics Analysis
          </h1>
          <p className="mt-8 text-lg font-[var(--font-display)] font-medium text-pretty text-gray-400 sm:text-xl/8 max-w-3xl mx-auto">
            Advanced computational tools for protein analysis, molecular simulations, and structural insights. Analyze <span style={{ color: '#00FFD1' }}>RMSD, RMSF, contact maps</span>, and more with our cutting-edge platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/analysis"
              className="rounded-md px-3.5 py-2.5 text-sm font-[var(--font-display)] font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00A4FF] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,164,255,0.5)]"
              style={{ background: 'linear-gradient(135deg, #00A4FF 0%, #6B00FF 100%)' }}
            >
              Start Analyzing
            </a>
            <a href="/about" className="text-sm/6 font-[var(--font-display)] font-semibold text-white hover:text-[#00FFD1] transition-colors duration-300">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Animated scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/60" />
        </div>
      </div>
    </div>
  )
}
