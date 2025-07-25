import SplitWithScreenshotOnDark from "@/components/blocks/heros/split-with-screenshot-on-dark"
import WithProductScreenshotOnLeft from "@/components/blocks/feature-sections/with-product-screenshot-on-left"
import { StatsWithGradient } from "@/components/blocks/stats/stats-with-gradient"
import { TestimonialsGridWithCenteredCarousel } from "@/components/blocks/testimonials/testimonials-grid-with-centered-carousel"
import { RevolutionizeCTA } from "@/components/blocks/ctas/split-with-globe"
import { SimpleFooterWithFourGrids } from "@/components/blocks/footers/simple-footer-with-four-grids"

export default function Home() {
  return (
    <main className="min-h-screen pt-24">
      <SplitWithScreenshotOnDark />
      <WithProductScreenshotOnLeft />
      <StatsWithGradient />
      <TestimonialsGridWithCenteredCarousel />
      <RevolutionizeCTA />
      <SimpleFooterWithFourGrids />
    </main>
  )
}
