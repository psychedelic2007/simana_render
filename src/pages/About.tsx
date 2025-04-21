import React from 'react';
import { motion } from 'framer-motion';
import { Target, Code, FileText, Download, Cpu } from 'lucide-react';
import Footer from '../components/Footer';

const About = () => {
  const features = [
    {
      icon: <FileText size={24} />,
      title: "Comprehensive analysis tools",
      description: "Complete suite of tools for MD simulation data analysis"
    },
    {
      icon: <Code size={24} />,
      title: "Interactive plotting",
      description: "Highly customizable, interactive visualization capabilities"
    },
    {
      icon: <Download size={24} />,
      title: "Multiple file formats",
      description: "Support for various simulation output formats"
    },
    {
      icon: <Cpu size={24} />,
      title: "High-resolution export",
      description: "Publication-ready image export options"
    }
  ];
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container px-4 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="pill bg-simana-lightBlue text-simana-blue mb-4">
            About Us
          </span>
          <h1 className="mb-6">About SIMANA</h1>
        </motion.div>
        
        {/* Mission Section */}
        <motion.section 
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-24"
        >
          <div className="glass rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-simana-lightBlue flex items-center justify-center text-simana-blue">
                  <Target size={32} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-4">Mission</h2>
                <p className="text-lg text-foreground/90 leading-relaxed">
                  SIMANA is dedicated to providing researchers and scientists with powerful, user-friendly tools for analyzing molecular dynamics simulation data alongwith performing multiple drug-discovery related calculations. Our platform aims to streamline the analysis process and enable deeper insights into molecular behavior.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
        
        {/* Features Section */}
        <section className="max-w-4xl mx-auto mb-24">
          <motion.h2 
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-2xl font-semibold mb-8 text-center"
          >
            Features
          </motion.h2>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="glass rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-simana-lightBlue flex items-center justify-center text-simana-blue">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
        
        {/* Technology Section */}
        <motion.section 
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-24"
        >
          <div className="glass rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl font-semibold mb-6">Technology</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-6">
              Our platform is built using modern web technologies to ensure fast, reliable performance and a seamless user experience. We utilize advanced data processing algorithms to provide accurate analysis results and high-quality visualizations.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['React', 'Python', 'Tailwind CSS', 'Framer Motion'].map((tech, index) => (
                <div 
                  key={index}
                  className="bg-simana-lightBlue bg-opacity-30 rounded-lg py-3 px-4 text-center"
                >
                  <span className="font-medium text-simana-blue">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
        
        {/* Updates Section */}
        <motion.section 
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl font-semibold mb-6">Updates</h2>
            <p className="text-lg text-foreground/90 leading-relaxed">
              We continuously improve our platform with new features and analysis tools. Stay tuned for regular updates and enhancements to better serve your research needs.
            </p>
          </div>
        </motion.section>
      </div>
      <div className="mb-32"></div>
      <Footer />
    </div>
  );
};

export default About;