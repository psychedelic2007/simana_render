"use client";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { GlobeConfig, Position, sampleGlobeData, sampleGlobeConfig } from './globe-types';

// This component will only render on the client side
const GlobeClientComponent = dynamic(() => import('./globe-client'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
  )
});

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
