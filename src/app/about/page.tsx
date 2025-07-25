"use client";

import { motion } from "framer-motion";
import { Activity, BarChart3, FileText, Download, Cpu, Palette, Layers, Zap } from "lucide-react";

export default function AboutPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: Activity,
      title: "Comprehensive Analysis Tools",
      description: "Complete suite of tools for MD simulation data analysis with advanced statistical algorithms."
    },
    {
      icon: BarChart3,
      title: "Interactive Plotting",
      description: "Highly customizable, interactive visualization capabilities with real-time data exploration."
    },
    {
      icon: FileText,
      title: "Multiple File Formats",
      description: "Support for various simulation output formats including GROMACS, AMBER, and CHARMM."
    },
    {
      icon: Download,
      title: "High-Resolution Export",
      description: "Publication-ready image export options with vector graphics and high DPI support."
    }
  ];

  const technologies = [
    { icon: Layers, name: "React", description: "Modern UI framework for responsive interfaces" },
    { icon: Cpu, name: "Python", description: "Powerful data processing and analysis engine" },
    { icon: Palette, name: "Tailwind CSS", description: "Utility-first CSS for beautiful styling" },
    { icon: Zap, name: "Framer Motion", description: "Smooth animations and micro-interactions" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F17] via-[#0A0F17] to-[#1a1f2e] pt-24">
      {/* Hero Section */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00A4FF]/10 to-[#6B00FF]/10 rounded-3xl blur-3xl"></div>
        <motion.div 
          className="max-w-6xl mx-auto text-center relative z-10"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-[#00A4FF] to-[#6B00FF] bg-clip-text text-transparent mb-6"
            variants={fadeInUp}
          >
            About SIMANA
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-[#64748B] mb-8 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            Powerful, user-friendly tools for analyzing molecular dynamics simulation data
          </motion.p>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-[#00A4FF] to-[#00FFD1] mx-auto rounded-full"
            variants={fadeInUp}
          ></motion.div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div 
            className="backdrop-blur-sm bg-white/5 rounded-2xl border border-[#64748B]/20 p-12 hover:border-[#00A4FF]/30 transition-all duration-500"
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-4xl font-bold text-white mb-8 text-center">Mission</h2>
            <div className="space-y-6 text-lg text-[#64748B] leading-relaxed">
              <p>
                SIMANA is dedicated to providing researchers and scientists with powerful, user-friendly tools 
                for analyzing molecular dynamics simulation data along with performing multiple drug-discovery 
                related calculations. Our platform aims to streamline the analysis process and enable deeper 
                insights into molecular behavior.
              </p>
              <p>
                We believe that advanced computational analysis should be accessible to all researchers, 
                regardless of their computational background. By combining intuitive interfaces with powerful 
                algorithms, SIMANA democratizes access to sophisticated analytical tools that were previously 
                available only to computational experts.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-4xl font-bold text-white text-center mb-16"
            variants={fadeInUp}
          >
            Features
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="group backdrop-blur-sm bg-white/5 rounded-2xl border border-[#64748B]/20 p-8 text-center hover:border-[#00A4FF]/40 transition-all duration-500 hover:shadow-lg hover:shadow-[#00A4FF]/20"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#00A4FF] to-[#6B00FF] rounded-xl mb-6 group-hover:shadow-lg group-hover:shadow-[#00A4FF]/30 transition-all duration-500">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-[#64748B] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Technology Section */}
      <section className="py-24 px-6">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2 
            className="text-4xl font-bold text-white text-center mb-8"
            variants={fadeInUp}
          >
            Technology
          </motion.h2>
          <motion.p 
            className="text-lg text-[#64748B] text-center mb-16 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            Our platform is built using modern web technologies to ensure fast, reliable performance and a seamless user experience. 
            We utilize advanced data processing algorithms to provide accurate analysis results and high-quality visualizations.
          </motion.p>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
          >
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, rotate: 1 }}
                className="backdrop-blur-sm bg-white/5 rounded-2xl border border-[#64748B]/20 p-8 text-center hover:border-[#00FFD1]/40 transition-all duration-500 hover:shadow-lg hover:shadow-[#00FFD1]/20"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#00FFD1] to-[#00A4FF] rounded-lg mb-4">
                  <tech.icon className="w-7 h-7 text-[#0A0F17]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{tech.name}</h3>
                <p className="text-sm text-[#64748B]">{tech.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Updates Section */}
      <section className="py-24 px-6">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <motion.div 
            className="backdrop-blur-sm bg-gradient-to-r from-[#00A4FF]/10 to-[#6B00FF]/10 rounded-2xl border border-[#64748B]/20 p-12 text-center hover:border-[#6B00FF]/30 transition-all duration-500"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-4xl font-bold text-white mb-8">Updates</h2>
            <div className="space-y-6 text-lg text-[#64748B] leading-relaxed">
              <p>
                We continuously improve our platform with new features and analysis tools. Stay tuned for regular updates 
                and enhancements to better serve your research needs.
              </p>
              <p>
                Our development team regularly incorporates user feedback and the latest computational methods to ensure 
                SIMANA remains at the cutting edge of molecular dynamics analysis tools.
              </p>
              <div className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#00A4FF] to-[#6B00FF] rounded-lg text-white font-semibold text-base mt-6 hover:shadow-lg hover:shadow-[#00A4FF]/30 transition-all duration-300">
                Always Evolving
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
