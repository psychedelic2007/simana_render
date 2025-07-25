"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from 'next/dynamic';

// This component will only render on the client side
const GlobeClientComponent = dynamic(() => import('./globe-client'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
  )
});

export type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

// Main World component that handles SSR
export function World(props: WorldProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return <GlobeClientComponent {...props} />;
}

// Utility functions (these don't use window so they're safe)
export function hexToRgb(hex: string) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function genRandomNumbers(min: number, max: number, count: number) {
  const arr = [];
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
}

// Sample data for multiple arcs
export const sampleGlobeData: Position[] = [
  {
    order: 1,
    startLat: -19.885592,
    startLng: -43.951191,
    endLat: -22.9068,
    endLng: -43.1729,
    arcAlt: 0.1,
    color: "#A07CFE",
  },
  {
    order: 1,
    startLat: 28.6139,
    startLng: 77.2090,
    endLat: 3.1390,
    endLng: 101.6869,
    arcAlt: 0.2,
    color: "#FE6244",
  },
  {
    order: 1,
    startLat: -19.885592,
    startLng: -43.951191,
    endLat: -1.098777,
    endLng: 116.4142,
    arcAlt: 0.5,
    color: "#9E00FF",
  },
  {
    order: 2,
    startLat: 1.3521,
    startLng: 103.8198,
    endLat: 35.6762,
    endLng: 139.6503,
    arcAlt: 0.2,
    color: "#18CCFC",
  },
  {
    order: 2,
    startLat: 51.5072,
    startLng: -0.1276,
    endLat: 3.1390,
    endLng: 101.6869,
    arcAlt: 0.3,
    color: "#6344FE",
  },
  {
    order: 2,
    startLat: -15.785493,
    startLng: -47.909029,
    endLat: 36.162909,
    endLng: -115.119411,
    arcAlt: 0.3,
    color: "#6344FE",
  },
  {
    order: 3,
    startLat: -33.8688,
    startLng: 151.2093,
    endLat: 22.3193,
    endLng: 114.1694,
    arcAlt: 0.3,
    color: "#18CCFC",
  },
  {
    order: 3,
    startLat: 21.3099,
    startLng: -157.8581,
    endLat: 40.7128,
    endLng: -74.0060,
    arcAlt: 0.3,
    color: "#FE6244",
  },
  {
    order: 3,
    startLat: -22.9068,
    startLng: -43.1729,
    endLat: 28.6139,
    endLng: 77.2090,
    arcAlt: 0.5,
    color: "#9E00FF",
  },
  {
    order: 4,
    startLat: 1.3521,
    startLng: 103.8198,
    endLat: -33.8688,
    endLng: 151.2093,
    arcAlt: 0.2,
    color: "#18CCFC",
  },
  {
    order: 4,
    startLat: 3.1390,
    startLng: 101.6869,
    endLat: -22.9068,
    endLng: -43.1729,
    arcAlt: 0.4,
    color: "#A07CFE",
  },
  {
    order: 5,
    startLat: 51.5072,
    startLng: -0.1276,
    endLat: 52.3676,
    endLng: 4.9041,
    arcAlt: 0.1,
    color: "#FE6244",
  },
  {
    order: 5,
    startLat: 5.4164,
    startLng: 100.3327,
    endLat: 51.5072,
    endLng: -0.1276,
    arcAlt: 0.3,
    color: "#6344FE",
  },
  {
    order: 6,
    startLat: 29.7604,
    startLng: -95.3698,
    endLat: 40.7128,
    endLng: -74.0060,
    arcAlt: 0.1,
    color: "#9E00FF",
  },
  {
    order: 6,
    startLat: 28.6139,
    startLng: 77.2090,
    endLat: 1.3521,
    endLng: 103.8198,
    arcAlt: 0.2,
    color: "#18CCFC",
  },
  {
    order: 7,
    startLat: -22.9068,
    startLng: -43.1729,
    endLat: -34.6037,
    endLng: -58.3816,
    arcAlt: 0.1,
    color: "#A07CFE",
  },
  {
    order: 7,
    startLat: 22.3193,
    startLng: 114.1694,
    endLat: 39.9042,
    endLng: 116.4074,
    arcAlt: 0.2,
    color: "#FE6244",
  },
  {
    order: 8,
    startLat: 1.3521,
    startLng: 103.8198,
    endLat: 35.6762,
    endLng: 139.6503,
    arcAlt: 0.2,
    color: "#18CCFC",
  },
  {
    order: 8,
    startLat: -33.8688,
    startLng: 151.2093,
    endLat: -31.9505,
    endLng: 115.8605,
    arcAlt: 0.2,
    color: "#9E00FF",
  },
  {
    order: 9,
    startLat: 51.5072,
    startLng: -0.1276,
    endLat: 41.9028,
    endLng: 12.4964,
    arcAlt: 0.1,
    color: "#6344FE",
  },
  {
    order: 9,
    startLat: 22.3193,
    startLng: 114.1694,
    endLat: -33.8688,
    endLng: 151.2093,
    arcAlt: 0.3,
    color: "#A07CFE",
  },
];

// Sample globe configuration
export const sampleGlobeConfig: GlobeConfig = {
  pointSize: 4,
  globeColor: "#062056",
  showAtmosphere: true,
  atmosphereColor: "#FFFFFF",
  atmosphereAltitude: 0.1,
  emissive: "#062056",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.7)",
  ambientLight: "#38bdf8",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  autoRotate: true,
  autoRotateSpeed: 0.5,
};

// Example usage component
export default function GlobeDemo() {
  return (
    <div className="flex flex-row items-center justify-center py-20 h-screen md:h-auto dark:bg-black bg-white relative w-full">
      <div className="max-w-7xl mx-auto w-full relative overflow-hidden h-full md:h-[40rem] px-4">
        <div className="absolute w-full bottom-0 inset-x-0 h-40 bg-gradient-to-b pointer-events-none select-none from-transparent dark:to-black to-white z-40" />
        <div className="absolute w-full h-72 md:h-full z-10">
          <World data={sampleGlobeData} globeConfig={sampleGlobeConfig} />
        </div>
      </div>
    </div>
  );
}
