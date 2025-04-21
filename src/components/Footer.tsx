import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-simana-blue">SIMANA</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Advanced tools for analyzing and visualizing molecular dynamics simulation data
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-simana-blue transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-simana-blue transition-colors">
              Contact
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-simana-blue transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-simana-blue transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SIMANA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 