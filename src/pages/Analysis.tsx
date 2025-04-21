import React from 'react';
import { 
  LineChart, BarChart, TrendingUp, Maximize, Box, List, 
  Network, Share2, Dna, Map, Radar, Egg, Pill, GitCompare
} from 'lucide-react';
import AnalysisTool from '@/components/AnalysisTool';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Analysis = () => {
  const navigate = useNavigate();
  
  const analysisTools = [
    { id: 'rmsd', title: 'RMSD', icon: <TrendingUp size={24} />, description: 'Root Mean Square Deviation', route: '/analysis/rmsd' },
    { id: 'rmsf', title: 'RMSF', icon: <LineChart size={24} />, description: 'Root Mean Square Fluctuation', route: '/analysis/rmsf' },
    { id: 'rg', title: 'RG', icon: <Maximize size={24} />, description: 'Radius of Gyration', route: '/analysis/rg' },
    { id: 'sasa', title: 'SASA', icon: <Box size={24} />, description: 'Solvent Accessible Surface Area', route: '/analysis/sasa' },
    { id: 'hbond', title: 'HBOND', icon: <Share2 size={24} />, description: 'Hydrogen Bond Analysis', route: '/analysis/hbond' },
    { id: 'dccm', title: 'DCCM', icon: <Network size={24} />, description: 'Dynamic Cross-Correlation Matrix', route: '/analysis/dccm' },
    { id: 'pca', title: 'PCA', icon: <GitCompare size={24} />, description: 'Principal Component Analysis', route: '/analysis/pca' },
    { id: 'rama', title: 'RAMA', icon: <Dna size={24} />, description: 'Ramachandran Plot Analysis', route: '/analysis/rama' },
    { id: 'contact', title: 'CONTACT MAP', icon: <Map size={24} />, description: 'Residue Contact Map', route: '/analysis/contact' },
    { id: 'bfactor', title: 'BFACTOR', icon: <BarChart size={24} />, description: 'B-Factor Analysis', route: '/analysis/bfactor' },
    { id: 'boiled', title: 'BOILED EGG', icon: <Egg size={24} />, description: 'BOILED-Egg Prediction Model', route: '/analysis/boiled' },
    { id: 'lipinski', title: 'LIPINSKI', icon: <Pill size={24} />, description: 'Lipinski Rule of Five', route: '/analysis/lipinski' },
    { id: 'tanimoto', title: 'TANIMOTO', icon: <Radar size={24} />, description: 'Tanimoto Similarity Coefficient', route: '/analysis/tanimoto' },
  ];
  
  const handleToolSelect = (route: string) => {
    navigate(route);
  };
  
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="mb-4">Analysis Tools</h1>
          <p className="text-lg text-muted-foreground">
            Select an analysis tool to visualize and analyze your molecular dynamics simulation data
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysisTools.map((tool) => (
              <AnalysisTool
                key={tool.id}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                onClick={() => handleToolSelect(tool.route)}
              />
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Analysis;
