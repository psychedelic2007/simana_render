"use client"

import { motion } from "motion/react"
import { BarChart3, FlaskConical, Activity } from 'lucide-react'

const features = [
  {
    name: 'RMSD & RMSF Analysis.',
    description:
      'Track structural deviations and fluctuations over time with comprehensive root-mean-square deviation and fluctuation calculations.',
    icon: BarChart3,
  },
  {
    name: 'Molecular Structure Analysis.',
    description: 'Analyze radius of gyration, SASA measurements, and hydrogen bond networks for detailed structural insights.',
    icon: FlaskConical,
  },
  {
    name: 'Advanced Conformational Studies.',
    description: 'Perform PCA analysis, DCCM plotting, Ramachandran plots, and contact mapping for comprehensive conformational analysis.',
    icon: Activity,
  },
]

export default function WithProductScreenshotOnLeft() {
  return (
    <div className="overflow-hidden bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:ml-auto lg:pt-4 lg:pl-4"
          >
            <div className="lg:max-w-lg">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-base/7 font-semibold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent"
              >
                Molecular Dynamics Platform
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl"
              >
                Advanced Analysis Capabilities
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-lg/8 text-muted-foreground"
              >
                Our platform provides comprehensive analysis tools for molecular dynamics simulations including RMSD tracking, RMSF analysis, radius of gyration calculations, SASA measurements, hydrogen bond analysis, DCCM plotting, PCA analysis, Ramachandran plots, contact mapping, and B-factor analysis.
              </motion.p>
              <motion.dl 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10 max-w-xl space-y-8 text-base/7 text-muted-foreground lg:max-w-none"
              >
                {features.map((feature, index) => (
                  <motion.div 
                    key={feature.name} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="relative pl-9 group cursor-pointer"
                  >
                    <dt className="inline font-semibold text-foreground">
                      <feature.icon 
                        aria-hidden="true" 
                        className="absolute top-1 left-1 size-5 text-primary group-hover:text-accent transition-colors duration-300" 
                      />
                      <span className="group-hover:text-accent transition-colors duration-300">
                        {feature.name}
                      </span>
                    </dt>{' '}
                    <dd className="inline group-hover:text-foreground transition-colors duration-300">{feature.description}</dd>
                  </motion.div>
                ))}
              </motion.dl>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-start justify-end lg:order-first"
          >
            <div className="relative w-full max-w-none">
              {/* Floating Code Editor Mockup */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="relative bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl rounded-xl border border-border/20 shadow-2xl overflow-hidden"
              >
                {/* Code Editor Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-card/40">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm text-muted-foreground">md_analysis.py</div>
                  <div className="w-12"></div>
                </div>
                
                {/* Code Content */}
                <div className="p-6 font-mono text-sm bg-gradient-to-br from-background/90 to-background/80">
                  <div className="space-y-2">
                    <div className="text-muted-foreground"># Molecular Dynamics Analysis</div>
                    <div><span className="text-chart-2">import</span> <span className="text-accent">MDAnalysis</span> <span className="text-chart-2">as</span> <span className="text-accent">mda</span></div>
                    <div><span className="text-chart-2">import</span> <span className="text-accent">numpy</span> <span className="text-chart-2">as</span> <span className="text-accent">np</span></div>
                    <div className="mt-4">
                      <span className="text-chart-2">def</span> <span className="text-primary">calculate_rmsd</span>(<span className="text-accent">universe</span>):
                    </div>
                    <div className="ml-4 text-muted-foreground"># RMSD calculation</div>
                    <div className="ml-4">
                      <span className="text-accent">protein</span> = <span className="text-accent">universe</span>.<span className="text-primary">select_atoms</span>(<span className="text-green-400">'protein'</span>)
                    </div>
                    <div className="ml-4">
                      <span className="text-chart-2">return</span> <span className="text-primary">rms</span>.<span className="text-primary">rmsd</span>(<span className="text-accent">protein</span>)
                    </div>
                  </div>
                  
                  {/* Molecular Structure Visualization */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-chart-2/10 border border-primary/20"
                  >
                    <div className="text-xs text-accent mb-2">&gt;&gt;&gt; Protein Structure Analysis</div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="text-primary">RMSD: 2.34 Å</div>
                        <div className="text-accent">Gyration: 15.7 Å</div>
                      </div>
                      <div className="w-16 h-16 rounded border border-accent/30 bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-2 border-accent border-dashed rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Floating accent elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-chart-2/20 rounded-full blur-xl"
              ></motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-2xl"
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
