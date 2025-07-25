export interface LipinskiCompound {
  smiles: string;
  MW: number;
  nBonds: number;
  fChar: number;
  nHet: number;
  MaxRing: number;
  nRing: number;
  nRot: number;
  TPSA: number;
  nHD: number;
  nHA: number;
  LogP: number;
  LogD: number;
  LogS: number;
  SC: number;
  FollowsLipinski: string;
  Violations: string;
  AtomDistribution: Record<string, number>;
  moleculeImage?: string;
}

export interface LipinskiAnalysisResult {
  compounds: LipinskiCompound[];
  distributionPlot?: string;
  csvData?: string;
  validCount?: number;
  invalidCount?: number;
  invalidSmiles?: string[];
}

// API functions for Lipinski analysis
export const analyzeLipinskiCompounds = async (
  smilesInput: string[] | File,
  customizations?: {
    imageSize?: number;
    dpi?: number;
  }
): Promise<LipinskiAnalysisResult> => {
  try {
    const formData = new FormData();
    
    if (smilesInput instanceof File) {
      console.log("Processing file input:", smilesInput.name);
      formData.append('file', smilesInput);
    } else {
      console.log("Processing SMILES list input:", smilesInput);
      formData.append('smiles_list', JSON.stringify(smilesInput));
    }
    
    if (customizations) {
      if (customizations.imageSize) {
        formData.append('image_size', customizations.imageSize.toString());
      }
      if (customizations.dpi) {
        formData.append('dpi', customizations.dpi.toString());
      }
    }
    
    const response = await fetch('http://localhost:8000/api/lipinski', {
      method: 'POST',
      body: formData,
    });
    
    console.log("Received response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error response:", errorText);
      throw new Error(`Backend response error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Received response data:", {
      hasCompounds: !!data.compounds,
      compoundCount: data.compounds?.length,
      hasDistributionPlot: !!data.distribution_plot,
      hasCsvData: !!data.csv_data
    });
    
    if (data.error) {
      console.error("Backend returned error:", data.error);
      throw new Error(`Backend error: ${data.error}`);
    }
    
    return {
      compounds: data.compounds || [],
      distributionPlot: data.distribution_plot,
      csvData: data.csv_data,
      validCount: data.valid_count || 0,
      invalidCount: data.invalid_count || 0,
      invalidSmiles: data.invalid_smiles || []
    };
  } catch (error) {
    console.error("Error in analyzeLipinskiCompounds:", error);
    throw error;
  }
};

export const generateRadarPlot = async (
  compound: LipinskiCompound,
  customizations?: {
    dpi?: number;
  }
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('compound_data', JSON.stringify(compound));
    
    if (customizations?.dpi) {
      formData.append('dpi', customizations.dpi.toString());
    }
    
    const response = await fetch('http://localhost:8000/api/lipinski_radar', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend response error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Backend error: ${data.error}`);
    }
    
    return data.radar_plot;
  } catch (error) {
    console.error("Error generating radar plot:", error);
    throw error;
  }
};

// Function to download Lipinski analysis results as CSV
export const downloadCsv = (compounds: LipinskiCompound[]) => {
  // Create CSV header with all Lipinski properties
  const headers = [
    'SMILES',
    'Molecular Weight (MW)',
    'Number of Bonds',
    'Formal Charge',
    'Number of Heteroatoms',
    'Max Ring Size',
    'Number of Rings',
    'Rotatable Bonds',
    'TPSA',
    'H-bond Donors (nHD)',
    'H-bond Acceptors (nHA)',
    'LogP',
    'LogD',
    'LogS',
    'Synthetic Complexity',
    'Follows Lipinski',
    'Violations',
    'Atom Distribution'
  ];
  
  // Create CSV content
  const rows = compounds.map(compound => [
    `"${compound.smiles}"`, // Wrap SMILES in quotes
    compound.MW,
    compound.nBonds,
    compound.fChar,
    compound.nHet,
    compound.MaxRing,
    compound.nRing,
    compound.nRot,
    compound.TPSA,
    compound.nHD,
    compound.nHA,
    compound.LogP,
    compound.LogD,
    compound.LogS,
    compound.SC,
    `"${compound.FollowsLipinski}"`,
    `"${compound.Violations}"`,
    `"${JSON.stringify(compound.AtomDistribution)}"` // Convert object to JSON string
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'lipinski_analysis_results.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};

// Default property ranges for visualization
export const propertyRanges = {
  MW: { min: 160, max: 500, ideal: 250 },
  LogP: { min: -3, max: 5, ideal: 2.5 },
  TPSA: { min: 0, max: 140, ideal: 70 },
  nHD: { min: 0, max: 5, ideal: 2 },
  nHA: { min: 0, max: 10, ideal: 5 },
  nRing: { min: 0, max: 4, ideal: 2 }
};

// Lipinski Rule of Five criteria
export const lipinskiCriteria = {
  MW: { max: 500, label: "Molecular Weight ≤ 500 Da" },
  LogP: { max: 5, label: "LogP ≤ 5" },
  nHD: { max: 5, label: "H-bond donors ≤ 5" },
  nHA: { max: 10, label: "H-bond acceptors ≤ 10" }
};

// Helper function to check if a compound follows Lipinski's Rule of Five
export const checkLipinskiCompliance = (compound: LipinskiCompound): {
  isCompliant: boolean;
  violations: string[];
  violationCount: number;
} => {
  const violations: string[] = [];
  
  if (compound.MW > lipinskiCriteria.MW.max) {
    violations.push(`MW > ${lipinskiCriteria.MW.max} (${compound.MW.toFixed(2)})`);
  }
  
  if (compound.LogP > lipinskiCriteria.LogP.max) {
    violations.push(`LogP > ${lipinskiCriteria.LogP.max} (${compound.LogP.toFixed(2)})`);
  }
  
  if (compound.nHD > lipinskiCriteria.nHD.max) {
    violations.push(`H-donors > ${lipinskiCriteria.nHD.max} (${compound.nHD})`);
  }
  
  if (compound.nHA > lipinskiCriteria.nHA.max) {
    violations.push(`H-acceptors > ${lipinskiCriteria.nHA.max} (${compound.nHA})`);
  }
  
  return {
    isCompliant: violations.length === 0,
    violations,
    violationCount: violations.length
  };
};

// Helper function to categorize compounds by compliance
export const categorizeCompounds = (compounds: LipinskiCompound[]) => {
  const compliant: LipinskiCompound[] = [];
  const nonCompliant: LipinskiCompound[] = [];
  
  compounds.forEach(compound => {
    const { isCompliant } = checkLipinskiCompliance(compound);
    if (isCompliant) {
      compliant.push(compound);
    } else {
      nonCompliant.push(compound);
    }
  });
  
  return {
    compliant,
    nonCompliant,
    complianceRate: compounds.length > 0 ? (compliant.length / compounds.length) * 100 : 0
  };
};
