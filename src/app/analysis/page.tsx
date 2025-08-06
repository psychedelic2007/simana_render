"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Activity,
  BarChart3,
  Target,
  Waves,
  Network,
  Zap,
  TrendingUp,
  Grid3x3,
  Users,
  Atom,
  Pill,
  FlaskConical,
  GitMerge
} from 'lucide-react';
import Link from 'next/link';
import { SimpleFooterWithFourGrids } from "@/components/blocks/footers/simple-footer-with-four-grids";

interface AnalysisModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'structural' | 'dynamic' | 'property' | 'similarity';
}

const analysisModules: AnalysisModule[] = [
  {
    id: 'rmsd',
    title: 'RMSD Analysis',
    description: 'Root Mean Square Deviation analysis to measure structural similarity over time',
    icon: Activity,
    category: 'structural'
  },
  {
    id: 'rmsf',
    title: 'RMSF Analysis',
    description: 'Root Mean Square Fluctuation to analyze residue flexibility and mobility',
    icon: Waves,
    category: 'dynamic'
  },
  {
    id: 'rg',
    title: 'Radius of Gyration',
    description: 'Measure protein compactness and overall shape changes during simulation',
    icon: Target,
    category: 'structural'
  },
  {
    id: 'sasa',
    title: 'SASA Analysis',
    description: 'Solvent Accessible Surface Area calculation for protein-solvent interactions',
    icon: BarChart3,
    category: 'structural'
  },
  {
    id: 'hydrogen-bonds',
    title: 'Hydrogen Bond Analysis',
    description: 'Track formation and breaking of hydrogen bonds throughout simulation',
    icon: Zap,
    category: 'dynamic'
  },
  {
    id: 'dccm',
    title: 'Dynamic Cross-Correlation Map',
    description: 'Analyze correlated motions between different protein regions',
    icon: Grid3x3,
    category: 'dynamic'
  },
  {
    id: 'pca',
    title: 'Principal Component Analysis',
    description: 'Identify major modes of motion and reduce dimensional complexity',
    icon: TrendingUp,
    category: 'dynamic'
  },
  {
    id: 'ramachandran',
    title: 'Ramachandran Plot',
    description: 'Validate protein structure by analyzing backbone dihedral angles',
    icon: Network,
    category: 'structural'
  },
  {
    id: 'contact',
    title: 'Contact Map Analysis',
    description: 'Visualize and analyze inter-residue contacts and their evolution',
    icon: Users,
    category: 'structural'
  },
  {
    id: 'bfactor',
    title: 'B-factor Analysis',
    description: 'Temperature factor analysis to identify flexible and rigid regions',
    icon: Atom,
    category: 'dynamic'
  },
  {
    id: 'boiled',
    title: 'Boiled Egg Plots',
    description: 'Predict drug-likeness and brain penetration properties',
    icon: Pill,
    category: 'property'
  },
  {
    id: 'lipinski',
    title: 'Lipinski Analysis',
    description: 'Evaluate drug-likeness properties using Lipinski\'s Rule of Five',
    icon: FlaskConical,
    category: 'property'
  },
  {
    id: 'tanimoto',
    title: 'Tanimoto Similarity',
    description: 'Calculate molecular similarity using Tanimoto coefficients',
    icon: GitMerge,
    category: 'similarity'
  }
];

const categoryColors = {
  structural: 'from-blue-500/20 to-blue-600/20',
  dynamic: 'from-purple-500/20 to-purple-600/20',
  property: 'from-cyan-500/20 to-cyan-600/20',
  similarity: 'from-green-500/20 to-green-600/20'
};

const moduleIdToPage: Record<string, string> = {
  rmsd: '/analysis/rmsd',
  rmsf: '/analysis/rmsf',
  rg: '/analysis/rg',
  sasa: '/analysis/sasa',
  hydrogen: '/analysis/hydrogen',
  dccm: '/analysis/dccm',
  pca: '/analysis/pca',
  ramachandran: '/analysis/ramachandran',
  contact: '/analysis/contact',
  bfactor: '/analysis/bfactor',
  boiled: '/analysis/boiled',
  lipinski: '/analysis/lipinski',
  tanimoto: '/analysis/tanimoto',
};

const AnalysisCard = ({ module, index }: { module: AnalysisModule; index: number }) => {
  const IconComponent = module.icon;
  const href = moduleIdToPage[module.id] || '#';

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: index * 0.1,
          ease: "easeOut"
        }}
        whileHover={{ 
          y: -8,
          transition: { duration: 0.3 }
        }}
        className="h-full"
      >
        <Card className="h-full bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group cursor-pointer overflow-hidden relative">
          {/* Gradient Background Effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[module.category]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="p-6 relative z-10 h-full flex flex-col">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <IconComponent className="w-6 h-6 text-primary group-hover:text-accent transition-colors duration-300" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent transition-colors duration-300">
                {module.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                {module.description}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300 capitalize">
                {module.category}
              </span>
            </div>
          </div>
          {/* Hover Border Effect */}
          <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-gradient-to-r group-hover:from-primary/50 group-hover:to-accent/50 transition-all duration-300" />
        </Card>
      </motion.div>
    </Link>
  );
};

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-[#0A0F17] text-white pt-24">
      <div className="container mx-auto px-6 py-24">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Analysis Suite
          </motion.h1>
          <motion.p 
            className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Comprehensive molecular dynamics analysis tools for structural insights, 
            dynamic behavior characterization, and property prediction
          </motion.p>
        </motion.div>

        {/* Analysis Modules Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {analysisModules.map((module, index) => (
            <AnalysisCard key={module.id} module={module} index={index} />
          ))}
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div
          className="text-center mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <p className="text-slate-400 mb-8 text-lg">
            Need a custom analysis module? Get in touch with our research team.
          </p>
          <motion.button
            className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Request Custom Analysis
          </motion.button>
        </motion.div>
      </div>
      <SimpleFooterWithFourGrids />
    </div>
  );
}
