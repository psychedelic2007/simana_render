"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

// Dynamically import the World component to avoid SSR issues
const World = dynamic(() => import('@/components/ui/globe').then(mod => ({ default: mod.World })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
    </div>
  )
});

const globeData = [
  {
    order: 1,
    startLat: 40.7128,
    startLng: -74.0060,
    endLat: 51.5074,
    endLng: -0.1278,
    arcAlt: 0.3,
    color: '#00A4FF'
  },
  {
    order: 2,
    startLat: 37.7749,
    startLng: -122.4194,
    endLat: 35.6762,
    endLng: 139.6503,
    arcAlt: 0.25,
    color: '#6B00FF'
  },
  {
    order: 3,
    startLat: 51.5074,
    startLng: -0.1278,
    endLat: -33.8688,
    endLng: 151.2093,
    arcAlt: 0.4,
    color: '#00FFD1'
  },
  {
    order: 4,
    startLat: 55.7558,
    startLng: 37.6176,
    endLat: 28.6139,
    endLng: 77.2090,
    arcAlt: 0.2,
    color: '#00A4FF'
  },
  {
    order: 5,
    startLat: -1.2921,
    startLng: 36.8219,
    endLat: 40.7128,
    endLng: -74.0060,
    arcAlt: 0.35,
    color: '#6B00FF'
  },
  {
    order: 6,
    startLat: -23.5505,
    startLng: -46.6333,
    endLat: 52.5200,
    endLng: 13.4050,
    arcAlt: 0.3,
    color: '#00FFD1'
  }
];

export const RevolutionizeCTA = () => {
  return (
    <section className="relative min-h-screen bg-[#0A0F17] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-400/20" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-8"
          >
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Ready to{' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  Revolutionize
                </span>{' '}
                Your Research?
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Join thousands of researchers worldwide who are accelerating their discoveries 
                with our AI-powered platform. Transform your research workflow today.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="group bg-transparent border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-800/50"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-sm text-gray-400 mt-1">Researchers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50M+</div>
                <div className="text-sm text-gray-400 mt-1">Data Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">95%</div>
                <div className="text-sm text-gray-400 mt-1">Success Rate</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Globe */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full h-[600px] max-w-[600px]">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full blur-2xl" />
              <World
                data={globeData}
                globeConfig={{
                  pointSize: 4,
                  globeColor: '#1d072e',
                  showAtmosphere: true,
                  atmosphereColor: '#6B00FF',
                  atmosphereAltitude: 0.1,
                  emissive: '#1d072e',
                  emissiveIntensity: 0.1,
                  shininess: 0.9,
                  polygonColor: 'rgba(255,255,255,0.7)',
                  ambientLight: '#6B00FF',
                  directionalLeftLight: '#00A4FF',
                  directionalTopLight: '#00FFD1',
                  pointLight: '#FFFFFF',
                  arcTime: 2000,
                  arcLength: 0.9,
                  rings: 1,
                  maxRings: 3,
                  initialPosition: { lat: 22.3193, lng: 114.1694 },
                  autoRotate: true,
                  autoRotateSpeed: 0.5
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0F17] to-transparent" />
    </section>
  );
};

