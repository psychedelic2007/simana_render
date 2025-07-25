export interface TanimotoPairwiseResult {
  similarity: number;
  mol1_image: string | null;
  mol2_image: string | null;
  has_mcs: boolean;
}

export interface TanimotoMatrixResult {
  similarity_matrix: number[][];
  heatmap: string;
  smiles_list: string[];
  valid_indices: number[];
}

// API functions for Tanimoto similarity analysis
export const calculatePairwiseSimilarity = async (
  smiles1: string,
  smiles2: string,
  customizations?: {
    dpi?: number;
  }
): Promise<TanimotoPairwiseResult> => {
  try {
    const formData = new FormData();
    formData.append('smiles1', smiles1);
    formData.append('smiles2', smiles2);
    
    if (customizations?.dpi) {
      formData.append('dpi', customizations.dpi.toString());
    }
    
    console.log("Calculating pairwise similarity for:", { smiles1, smiles2 });
    
    const response = await fetch('https://simana.onrender.com/api/tanimoto', {
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
    console.log("Received pairwise similarity data:", {
      similarity: data.similarity,
      hasMol1Image: !!data.mol1_image,
      hasMol2Image: !!data.mol2_image,
      hasMcs: data.has_mcs
    });
    
    if (data.error) {
      console.error("Backend returned error:", data.error);
      throw new Error(`Backend error: ${data.error}`);
    }
    
    return {
      similarity: data.similarity,
      mol1_image: data.mol1_image,
      mol2_image: data.mol2_image,
      has_mcs: data.has_mcs
    };
  } catch (error) {
    console.error("Error in calculatePairwiseSimilarity:", error);
    throw error;
  }
};

export const calculateMatrixSimilarity = async (
  smilesInput: string[] | File,
  customizations?: {
    colorScheme?: string;
    dpi?: number;
  }
): Promise<TanimotoMatrixResult> => {
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
      if (customizations.colorScheme) {
        formData.append('color_scheme', customizations.colorScheme);
      }
      if (customizations.dpi) {
        formData.append('dpi', customizations.dpi.toString());
      }
    }
    
    const response = await fetch('http://localhost:8000/api/tanimoto_matrix', {
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
    console.log("Received matrix similarity data:", {
      hasMatrix: !!data.similarity_matrix,
      hasHeatmap: !!data.heatmap,
      smilesCount: data.smiles_list?.length,
      validIndicesCount: data.valid_indices?.length
    });
    
    if (data.error) {
      console.error("Backend returned error:", data.error);
      throw new Error(`Backend error: ${data.error}`);
    }
    
    return {
      similarity_matrix: data.similarity_matrix || [],
      heatmap: data.heatmap,
      smiles_list: data.smiles_list || [],
      valid_indices: data.valid_indices || []
    };
  } catch (error) {
    console.error("Error in calculateMatrixSimilarity:", error);
    throw error;
  }
};

// Available color schemes for heatmap visualization
export const colorSchemes = {
  Blues: 'Blues',
  Reds: 'Reds',
  Greens: 'Greens',
  Purples: 'Purples',
  YlOrRd: 'YlOrRd',
  YlOrBr: 'YlOrBr',
  YlGnBu: 'YlGnBu',
  RdPu: 'RdPu',
  PuRd: 'PuRd',
  Viridis: 'Viridis',
  Plasma: 'Plasma',
  Inferno: 'Inferno',
  Magma: 'Magma'
} as const;

export type ColorScheme = keyof typeof colorSchemes;

// Helper function to interpret similarity scores
export const interpretSimilarity = (similarity: number): {
  level: string;
  description: string;
  color: string;
} => {
  if (similarity >= 0.85) {
    return {
      level: 'Very High',
      description: 'Compounds are very similar in structure',
      color: '#22c55e' // green
    };
  } else if (similarity >= 0.70) {
    return {
      level: 'High',
      description: 'Compounds share significant structural features',
      color: '#84cc16' // lime
    };
  } else if (similarity >= 0.50) {
    return {
      level: 'Moderate',
      description: 'Compounds have some structural similarities',
      color: '#eab308' // yellow
    };
  } else if (similarity >= 0.30) {
    return {
      level: 'Low',
      description: 'Compounds have limited structural similarities',
      color: '#f97316' // orange
    };
  } else {
    return {
      level: 'Very Low',
      description: 'Compounds are structurally dissimilar',
      color: '#ef4444' // red
    };
  }
};

// Helper function to find most similar compounds in a matrix
export const findMostSimilarPairs = (
  matrix: number[][],
  smilesList: string[],
  topN: number = 5
): Array<{
  smiles1: string;
  smiles2: string;
  similarity: number;
  index1: number;
  index2: number;
}> => {
  const pairs: Array<{
    smiles1: string;
    smiles2: string;
    similarity: number;
    index1: number;
    index2: number;
  }> = [];
  
  // Extract upper triangle of matrix (avoid duplicates and self-comparisons)
  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix[i].length; j++) {
      pairs.push({
        smiles1: smilesList[i],
        smiles2: smilesList[j],
        similarity: matrix[i][j],
        index1: i,
        index2: j
      });
    }
  }
  
  // Sort by similarity (descending) and return top N
  return pairs
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
};

// Helper function to calculate matrix statistics
export const calculateMatrixStats = (matrix: number[][]): {
  mean: number;
  median: number;
  min: number;
  max: number;
  std: number;
} => {
  // Extract upper triangle values (excluding diagonal)
  const values: number[] = [];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix[i].length; j++) {
      values.push(matrix[i][j]);
    }
  }
  
  if (values.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, std: 0 };
  }
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
    : sortedValues[Math.floor(sortedValues.length / 2)];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  
  return { mean, median, min, max, std };
};

// Function to download similarity matrix as CSV
export const downloadSimilarityMatrix = (
  matrix: number[][],
  smilesList: string[]
) => {
  // Create CSV header with SMILES as row/column labels
  const headers = ['SMILES', ...smilesList];
  
  // Create CSV content
  const rows = matrix.map((row, index) => [
    `"${smilesList[index]}"`, // SMILES for this row
    ...row.map(val => val.toFixed(4)) // Similarity values
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
  link.setAttribute('download', 'tanimoto_similarity_matrix.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};
