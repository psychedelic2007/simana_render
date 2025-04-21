
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AnalysisToolProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
}

const AnalysisTool: React.FC<AnalysisToolProps> = ({
  title,
  description,
  icon,
  isSelected = false,
  onClick
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative p-6 rounded-xl glass card-hover cursor-pointer transition-all duration-300',
        isSelected ? 'ring-2 ring-simana-blue shadow-lg' : 'hover:shadow-md'
      )}
      onClick={onClick}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 rounded-full bg-simana-blue" />
        </div>
      )}
      
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-lg bg-simana-lightBlue flex items-center justify-center text-simana-blue">
          {icon}
        </div>
        
        <div className="space-y-1">
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisTool;
