import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Import analysis tool pages
import RMSDAnalysis from "./pages/analyses/RMSD";
import RMSFAnalysis from "./pages/analyses/RMSF";
import RoGAnalysis from "./pages/analyses/RoG";
import SASAAnalysis from "./pages/analyses/SASA";
import { DCCMAnalysis } from "./pages/analyses/DCCM";
import RamaAnalysis from "./pages/analyses/Rama";
import ContactMapAnalysis from "./pages/analyses/ContactMap";
import BFactorAnalysis from "./pages/analyses/BFactor";
import PCAAnalysis from "./pages/analyses/PCA";
import BoiledEggAnalysis from "./pages/analyses/BoiledEgg";
import LipinskiAnalysis from "./pages/analyses/Lipinski";
import TanimotoAnalysis from "./pages/analyses/Tanimoto";
import HBondAnalysis from "./pages/analyses/HBond";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/analysis/rmsd" element={<RMSDAnalysis />} />
            <Route path="/analysis/rmsf" element={<RMSFAnalysis />} />
            <Route path="/analysis/rg" element={<RoGAnalysis />} />
            <Route path="/analysis/sasa" element={<SASAAnalysis />} />
            <Route path="/analysis/hbond" element={<HBondAnalysis />} />
            <Route path="/analysis/dccm" element={<DCCMAnalysis />} />
            <Route path="/analysis/pca" element={<PCAAnalysis />} />
            <Route path="/analysis/rama" element={<RamaAnalysis />} />
            <Route path="/analysis/contact" element={<ContactMapAnalysis />} />
            <Route path="/analysis/bfactor" element={<BFactorAnalysis />} />
            <Route path="/analysis/boiled" element={<BoiledEggAnalysis />} />
            <Route path="/analysis/lipinski" element={<LipinskiAnalysis />} />
            <Route path="/analysis/tanimoto" element={<TanimotoAnalysis />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
