"use client"

export default function SimpleCenteredWithGradient() {
  return (
    <div className="relative isolate overflow-hidden bg-background">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl font-[var(--font-display)]">
            Ready to Revolutionize Your Research?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-muted">
            Join thousands of researchers using cutting-edge molecular dynamics analysis. 
            Get instant insights, accelerate discoveries, and transform your research workflow today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-background hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-300"
            >
              Start Free Trial
            </a>
            <a href="#" className="text-sm/6 font-semibold text-foreground hover:text-muted transition-colors duration-300">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
      <svg
        viewBox="0 0 1024 1024"
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -z-10 size-256 -translate-x-1/2 mask-[radial-gradient(closest-side,white,transparent)] animate-pulse"
      >
        <circle r={512} cx={512} cy={512} fill="url(#electric-purple-gradient)" fillOpacity="0.7" />
        <defs>
          <radialGradient id="electric-purple-gradient">
            <stop stopColor="#00A4FF" />
            <stop offset={1} stopColor="#6B00FF" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}
