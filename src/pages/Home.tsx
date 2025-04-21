import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LineChart, Activity, BarChart, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const Home = () => {
  const features = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Real-time Analysis",
      description: "Instantly analyze your MD simulation data with our interactive tools"
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Multiple Analyses",
      description: "Comprehensive suite of analysis tools including RMSD, RMSF, and more"
    },
    {
      icon: <LineChart className="w-6 h-6" />,
      title: "Interactive Plots",
      description: "Customizable, publication-ready visualizations of your data"
    },
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "Intelligent Processing",
      description: "Smart data processing algorithms for accurate results"
    }
  ];
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[800px] bg-simana-blue opacity-[0.07] blur-[100px] rounded-full" />
        </div>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <span className="pill bg-simana-lightBlue text-simana-blue">
                Molecular Dynamics Analysis
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 font-bold"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-simana-blue to-simana-accent">
                SIMulation ANAlysis
              </span>{" "}
              <span className="block text-xl md:text-2xl font-medium mt-2">
                Advanced tools for analyzing and visualizing molecular dynamics simulation data
              </span>
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to="/analysis" className="btn-primary inline-flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container px-4 mx-auto">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                className="glass rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-simana-lightBlue rounded-lg flex items-center justify-center mx-auto mb-4 text-simana-blue">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="mb-4">What SIMANA Does?</h2>
            <p className="text-lg text-muted-foreground">
              Simple steps to analyze your molecular dynamics simulation data
            </p>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-4xl mx-auto space-y-12"
          >
            {[
              "Navigate to the Analysis page using the top navigation bar",
              "Select your desired analysis type from the available options",
              "Upload your file(s) and configure analysis parameters",
              "Generate and customize your plots",
              "Download high-resolution images for publication"
            ].map((step, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-simana-lightBlue text-simana-blue flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="pt-1.5">
                  <p className="text-lg">{step}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mt-12"
          >
            <Link to="/analysis" className="btn-primary inline-flex items-center gap-2">
              Start Analyzing <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Citation Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-8">Please cite the following work:</h2>
            <div className="glass rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-medium">Bacopa monnieri phytochemicals as promising BACE1 inhibitors for Alzheimer's disease therapy</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground">Sangeet S, Khan A</p>
                <p className="text-muted-foreground">Scientific Reports</p>
                <p className="text-muted-foreground">doi: 10.1038/s41598-025-92644-y</p>
              </div>
              <div className="pt-4">
                <a 
                  href="https://doi.org/10.1038/s41598-025-92644-y" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-simana-blue hover:text-simana-accent transition-colors inline-flex items-center gap-2"
                >
                  View Publication <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
