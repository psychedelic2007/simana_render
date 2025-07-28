from fastapi import FastAPI, UploadFile, File, Form, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from typing import List, Optional, Dict, Any, Union, Tuple
import tempfile
import json
import os
import io
import re
import base64
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import seaborn as sns
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import MDAnalysis as mda
from MDAnalysis.analysis.align import alignto
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import umap
from ramachandraw.utils import plot as rama_plot
from rdkit import Chem, DataStructs
from rdkit.Chem import Descriptors, Crippen, Lipinski, rdMolDescriptors, Draw, rdFMCS, AllChem
from rdkit.Chem.Draw import rdMolDraw2D
import csv
from collections import Counter
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
router = APIRouter()

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://simana-render.onrender.com",  # Add your actual frontend domain
        "https://simana.onrender.com", 
        "http://localhost:3000",  # For local development
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def parse_xvg(file_bytes):
    x_data = []
    y_data = []
    for line in file_bytes.decode().splitlines():
        if line.startswith('@') or line.startswith('#'):
            continue
        columns = line.strip().split()
        if len(columns) >= 2:
            x_data.append(float(columns[0]))
            y_data.append(float(columns[1]))
    return x_data, y_data

def calculate_dccm(pdb_path, xtc_path):
    """Calculate DCCM from PDB and XTC files"""
    try:
        # Load the universe
        u = mda.Universe(pdb_path, xtc_path)
        ca_atoms = u.select_atoms('name CA')
        
        if len(ca_atoms) == 0:
            raise ValueError("No CA atoms found in the structure")
        
        # Align trajectory
        alignto(u, u, select='name CA')
        
        # Extract positions
        positions = np.zeros((len(u.trajectory), len(ca_atoms), 3))
        for i, ts in enumerate(u.trajectory):
            positions[i] = ca_atoms.positions
        
        # Calculate fluctuations from mean positions
        mean_positions = positions.mean(axis=0)
        fluctuations = positions - mean_positions
        
        # Calculate correlation matrix
        n_residues = len(ca_atoms)
        dccm = np.zeros((n_residues, n_residues))
        
        for i in range(n_residues):
            for j in range(n_residues):
                fluc_i = fluctuations[:, i, :]
                fluc_j = fluctuations[:, j, :]
                
                # Calculate correlation coefficient
                dot_product = np.sum(fluc_i * fluc_j, axis=1)
                norm_i = np.linalg.norm(fluc_i, axis=1)
                norm_j = np.linalg.norm(fluc_j, axis=1)
                
                # Avoid division by zero
                valid_frames = (norm_i > 1e-10) & (norm_j > 1e-10)
                if np.sum(valid_frames) > 0:
                    correlation = dot_product[valid_frames] / (norm_i[valid_frames] * norm_j[valid_frames])
                    dccm[i, j] = np.mean(correlation)
                else:
                    dccm[i, j] = 0.0
        
        return dccm
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating DCCM: {str(e)}")

def plot_dccm(dccm, customizations):
    """Plot DCCM heatmap"""
    try:
        fig, ax = plt.subplots(figsize=(10, 10))
        
        # Create the heatmap
        im = ax.imshow(
            dccm, 
            cmap=customizations.get('colorMap', 'viridis'),
            vmin=customizations.get('minValue', -1),
            vmax=customizations.get('maxValue', 1),
            aspect='equal'
        )
        
        # Set labels
        ax.set_xlabel(customizations.get('xAxisLabel', 'Residue index'), fontsize=15)
        ax.set_ylabel(customizations.get('yAxisLabel', 'Residue index'), fontsize=15)
        ax.set_title(customizations.get('plotTitle', 'Dynamic Cross-Correlation Matrix'), fontsize=16)
        
        # Set ticks
        n_residues = dccm.shape[0]
        tick_interval = max(1, n_residues // 10)  # Show about 10 ticks
        ticks = np.arange(0, n_residues, tick_interval)
        ax.set_xticks(ticks)
        ax.set_yticks(ticks)
        ax.set_xticklabels(ticks + 1)  # 1-indexed for display
        ax.set_yticklabels(ticks + 1)  # 1-indexed for display
        
        ax.tick_params(axis='both', which='major', labelsize=12)
        
        # Add colorbar
        if customizations.get('showColorbar', True):
            cbar = plt.colorbar(im, ax=ax)
            cbar.set_label(customizations.get('colorbarLabel', 'Correlation Coefficient'), fontsize=13)
            cbar.ax.tick_params(labelsize=11)
        
        plt.tight_layout()
        
        # Save plot to base64 string
        buffer = io.BytesIO()
        plt.savefig(
            buffer, 
            format='png', 
            dpi=customizations.get('dpi', 300),
            bbox_inches='tight',
            facecolor='white'
        )
        buffer.seek(0)
        
        # Convert to base64
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close(fig)  # Important: close the figure to free memory
        
        return f"data:image/png;base64,{image_base64}"
        
    except Exception as e:
        plt.close('all')  # Clean up any open figures
        raise HTTPException(status_code=500, detail=f"Error plotting DCCM: {str(e)}")

def perform_pca_analysis(pdb_path, xtc_path, selection='backbone', stride=1, n_components=10, comp1=0, comp2=1):
    """Perform PCA analysis on MD trajectory"""
    try:
        # Load the universe
        u = mda.Universe(pdb_path, xtc_path)
        
        # Select atoms based on selection string
        if selection == 'backbone':
            atoms = u.select_atoms('backbone')
        elif selection == 'ca':
            atoms = u.select_atoms('name CA')
        elif selection == 'protein':
            atoms = u.select_atoms('protein')
        else:
            atoms = u.select_atoms(selection)
        
        if len(atoms) == 0:
            raise ValueError(f"No atoms found for selection: {selection}")
        
        # Align trajectory
        alignto(u, u, select=selection)
        
        # Extract positions with stride
        n_frames = len(u.trajectory[::stride])
        positions = np.zeros((n_frames, len(atoms) * 3))
        
        for i, ts in enumerate(u.trajectory[::stride]):
            positions[i] = atoms.positions.flatten()
        
        # Center the data
        positions_centered = positions - positions.mean(axis=0)
        
        # Perform PCA
        pca = PCA(n_components=n_components)
        transformed = pca.fit_transform(positions_centered)
        
        # Calculate number of components for 70% variance
        cumulative_variance = np.cumsum(pca.explained_variance_ratio_)
        n_components_70 = np.argmax(cumulative_variance >= 0.7) + 1
        
        # Create component options for dropdown
        component_options = [{"value": i, "label": f"PC{i+1}"} for i in range(n_components)]
        
        return {
            'pca_object': pca,
            'transformed': transformed,
            'explained_variance': pca.explained_variance_ratio_.tolist(),
            'cumulative_variance': cumulative_variance.tolist(),
            'n_components_70': int(n_components_70),
            'component_options': component_options,
            'n_frames': n_frames,
            'n_atoms': len(atoms)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in PCA analysis: {str(e)}")

def perform_tsne_analysis(pdb_path, xtc_path, selection='backbone', stride=1, n_components=2):
    """Perform t-SNE analysis on MD trajectory"""
    try:
        u = mda.Universe(pdb_path, xtc_path)
        
        if selection == 'backbone':
            atoms = u.select_atoms('backbone')
        elif selection == 'ca':
            atoms = u.select_atoms('name CA')
        elif selection == 'protein':
            atoms = u.select_atoms('protein')
        else:
            atoms = u.select_atoms(selection)
        
        if len(atoms) == 0:
            raise ValueError(f"No atoms found for selection: {selection}")
        
        alignto(u, u, select=selection)
        
        n_frames = len(u.trajectory[::stride])
        positions = np.zeros((n_frames, len(atoms) * 3))
        
        for i, ts in enumerate(u.trajectory[::stride]):
            positions[i] = atoms.positions.flatten()
        
        # Perform t-SNE
        tsne = TSNE(n_components=n_components, random_state=42, perplexity=min(30, n_frames-1))
        transformed = tsne.fit_transform(positions)
        
        return {
            'transformed': transformed,
            'n_frames': n_frames,
            'n_atoms': len(atoms),
            'explained_variance': None,
            'cumulative_variance': None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in t-SNE analysis: {str(e)}")

def perform_umap_analysis(pdb_path, xtc_path, selection='backbone', stride=1, n_components=2):
    """Perform UMAP analysis on MD trajectory"""
    try:
        u = mda.Universe(pdb_path, xtc_path)
        
        if selection == 'backbone':
            atoms = u.select_atoms('backbone')
        elif selection == 'ca':
            atoms = u.select_atoms('name CA')
        elif selection == 'protein':
            atoms = u.select_atoms('protein')
        else:
            atoms = u.select_atoms(selection)
        
        if len(atoms) == 0:
            raise ValueError(f"No atoms found for selection: {selection}")
        
        alignto(u, u, select=selection)
        
        n_frames = len(u.trajectory[::stride])
        positions = np.zeros((n_frames, len(atoms) * 3))
        
        for i, ts in enumerate(u.trajectory[::stride]):
            positions[i] = atoms.positions.flatten()
        
        # Perform UMAP
        reducer = umap.UMAP(n_components=n_components, random_state=42)
        transformed = reducer.fit_transform(positions)
        
        return {
            'transformed': transformed,
            'n_frames': n_frames,
            'n_atoms': len(atoms),
            'explained_variance': None,
            'cumulative_variance': None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in UMAP analysis: {str(e)}")

def plot_variance_explained(explained_variance, cumulative_variance, dpi=300):
    """Plot explained variance"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    
    # Individual variance
    ax1.bar(range(1, len(explained_variance) + 1), explained_variance)
    ax1.set_xlabel('Principal Component')
    ax1.set_ylabel('Explained Variance Ratio')
    ax1.set_title('Explained Variance by Component')
    
    # Cumulative variance
    ax2.plot(range(1, len(cumulative_variance) + 1), cumulative_variance, 'o-')
    ax2.axhline(y=0.7, color='r', linestyle='--', label='70% threshold')
    ax2.set_xlabel('Principal Component')
    ax2.set_ylabel('Cumulative Explained Variance')
    ax2.set_title('Cumulative Explained Variance')
    ax2.legend()
    
    plt.tight_layout()
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=dpi, bbox_inches='tight', facecolor='white')
    buffer.seek(0)
    
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close(fig)
    
    return f"data:image/png;base64,{image_base64}"

def plot_projection(transformed, comp1=0, comp2=1, method='PCA', dpi=300):
    """Plot 2D projection"""
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Create colormap based on frame number (time)
    colors = np.arange(len(transformed))
    scatter = ax.scatter(transformed[:, comp1], transformed[:, comp2], 
                        c=colors, cmap='viridis', alpha=0.7, s=50)
    
    if method == 'PCA':
        ax.set_xlabel(f'PC{comp1+1}')
        ax.set_ylabel(f'PC{comp2+1}')
        ax.set_title(f'PCA Projection: PC{comp1+1} vs PC{comp2+1}')
    elif method == 'TSNE':
        ax.set_xlabel('t-SNE 1')
        ax.set_ylabel('t-SNE 2')
        ax.set_title('t-SNE Projection')
    elif method == 'UMAP':
        ax.set_xlabel('UMAP 1')
        ax.set_ylabel('UMAP 2')
        ax.set_title('UMAP Projection')
    
    # Add colorbar
    cbar = plt.colorbar(scatter, ax=ax)
    cbar.set_label('Frame Number', rotation=270, labelpad=15)
    
    plt.tight_layout()
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=dpi, bbox_inches='tight', facecolor='white')
    buffer.seek(0)
    
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close(fig)
    
    return f"data:image/png;base64,{image_base64}"

def generate_ramachandran_plot(pdb_path, customizations):
    """Generate Ramachandran plot using ramachandraw library"""
    try:
        # Create a temporary file for the plot output
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as plot_file:
            plot_temp_path = plot_file.name
        
        # Generate the plot using ramachandraw
        rama_plot(
            pdb_path,
            cmap=customizations.get('cmap', 'viridis'),
            alpha=customizations.get('alpha', 0.75),
            dpi=customizations.get('dpi', 300),
            save=True,
            show=False,
            filename=plot_temp_path
        )
        
        # Read the generated plot image
        with open(plot_temp_path, "rb") as f:
            image_data = f.read()
        
        # Convert to base64
        image_base64 = base64.b64encode(image_data).decode()
        
        # Clean up the temporary plot file
        os.remove(plot_temp_path)
        
        return f"data:image/png;base64,{image_base64}"
        
    except Exception as e:
        # Clean up if there's an error
        try:
            if 'plot_temp_path' in locals() and os.path.exists(plot_temp_path):
                os.remove(plot_temp_path)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Error generating Ramachandran plot: {str(e)}")

def extract_basic_statistics(pdb_path):
    """Extract basic statistics from PDB file"""
    try:
        u = mda.Universe(pdb_path)
        protein = u.select_atoms('protein')
        residues = protein.residues
        
        # Count residues by type
        residue_counts = {}
        for residue in residues:
            resname = residue.resname
            residue_counts[resname] = residue_counts.get(resname, 0) + 1
        
        statistics = {
            'total_residues': len(residues),
            'residue_types': len(residue_counts),
            'residue_composition': residue_counts
        }
        
        return statistics
        
    except Exception as e:
        print(f"Warning: Could not extract statistics: {e}")
        return {}

def calculate_contact_map(pdb_path, cutoff=8.0):
    """Calculate contact map from PDB file"""
    try:
        # Load the universe
        u = mda.Universe(pdb_path)
        ca_atoms = u.select_atoms('name CA')
        
        if len(ca_atoms) == 0:
            raise ValueError("No CA atoms found in the structure")
        
        n_residues = len(ca_atoms)
        contact_matrix = np.zeros((n_residues, n_residues))
        
        # Calculate distances between all pairs of CA atoms
        positions = ca_atoms.positions
        
        for i in range(n_residues):
            for j in range(n_residues):
                if i != j:
                    distance = np.linalg.norm(positions[i] - positions[j])
                    if distance <= cutoff:
                        contact_matrix[i, j] = 1
                    else:
                        contact_matrix[i, j] = 0
                else:
                    contact_matrix[i, j] = 0  # No self-contacts
        
        return contact_matrix, n_residues
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating contact map: {str(e)}")

def plot_contact_map(contact_matrix, customizations):
    """Plot contact map heatmap"""
    try:
        fig, ax = plt.subplots(figsize=(10, 10))
        
        # Create the heatmap
        im = ax.imshow(
            contact_matrix, 
            cmap=customizations.get('cmap', 'viridis'),
            vmin=customizations.get('vmin', 0),
            vmax=customizations.get('vmax', 1),
            aspect='equal',
            origin='lower'
        )
        
        # Set labels
        ax.set_xlabel(customizations.get('xlabel', 'Residue Index'), 
                     fontsize=customizations.get('label_fontsize', 15))
        ax.set_ylabel(customizations.get('ylabel', 'Residue Index'), 
                     fontsize=customizations.get('label_fontsize', 15))
        ax.set_title('Contact Map', fontsize=16)
        
        # Set ticks
        n_residues = contact_matrix.shape[0]
        xticks_gap = customizations.get('xticks_gap', 10)
        yticks_gap = customizations.get('yticks_gap', 10)
        
        xticks = np.arange(0, n_residues, xticks_gap)
        yticks = np.arange(0, n_residues, yticks_gap)
        
        ax.set_xticks(xticks)
        ax.set_yticks(yticks)
        ax.set_xticklabels(xticks + 1)  # 1-indexed for display
        ax.set_yticklabels(yticks + 1)  # 1-indexed for display
        
        ax.tick_params(axis='both', which='major', 
                      labelsize=customizations.get('tick_labelsize', 12))
        
        # Set axis limits if provided
        if customizations.get('xlim_min') is not None and customizations.get('xlim_max') is not None:
            ax.set_xlim(customizations.get('xlim_min'), customizations.get('xlim_max'))
        if customizations.get('ylim_min') is not None and customizations.get('ylim_max') is not None:
            ax.set_ylim(customizations.get('ylim_min'), customizations.get('ylim_max'))
        
        # Add colorbar
        cbar = plt.colorbar(im, ax=ax)
        cbar.set_label('Contact', fontsize=13)
        cbar.ax.tick_params(labelsize=11)
        
        plt.tight_layout()
        
        # Save plot to base64 string
        buffer = io.BytesIO()
        plt.savefig(
            buffer, 
            format='png', 
            dpi=customizations.get('dpi', 300),
            bbox_inches='tight',
            facecolor='white'
        )
        buffer.seek(0)
        
        # Convert to base64
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close(fig)  # Important: close the figure to free memory
        
        return f"data:image/png;base64,{image_base64}"
        
    except Exception as e:
        plt.close('all')  # Clean up any open figures
        raise HTTPException(status_code=500, detail=f"Error plotting contact map: {str(e)}")

def analyze_bfactors(pdb_path):
    """Analyze B-factors from PDB file"""
    try:
        # Load the universe
        u = mda.Universe(pdb_path)
        ca_atoms = u.select_atoms('name CA')
        
        if len(ca_atoms) == 0:
            raise ValueError("No CA atoms found in the structure")
        
        # Extract B-factors and residue numbers
        residue_data = []
        for atom in ca_atoms:
            residue_data.append({
                'residue': int(atom.resid),  # Convert numpy.int64 to Python int
                'mean_bfactor': float(atom.tempfactor),  # Convert numpy.float64 to Python float
                'std_bfactor': 0.0  # For CA atoms, std is 0 since it's a single value per residue
            })
        
        return residue_data, len(ca_atoms)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing B-factors: {str(e)}")

def plot_bfactor_curve(residue_data, show_std_dev, customizations):
    """Plot B-factor curve"""
    try:
        residues = [data['residue'] for data in residue_data]
        mean_bfactors = [data['mean_bfactor'] for data in residue_data]
        std_bfactors = [data['std_bfactor'] for data in residue_data]
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Main line plot
        ax.plot(residues, mean_bfactors, 
               linewidth=customizations.get('curve_linewidth', 1.5),
               color='blue', label='Mean B-factor')
        
        # Add standard deviation if requested
        if show_std_dev and any(std > 0 for std in std_bfactors):
            mean_array = np.array(mean_bfactors)
            std_array = np.array(std_bfactors)
            ax.fill_between(residues, 
                          mean_array - std_array, 
                          mean_array + std_array,
                          alpha=0.3, color='blue', label='±1 Std Dev')
            ax.legend()
        
        # Set labels
        ax.set_xlabel(customizations.get('curve_x_label', 'Residue Number'), 
                     fontsize=customizations.get('curve_x_label_size', 12))
        ax.set_ylabel(customizations.get('curve_y_label', 'B-factor Mean'), 
                     fontsize=customizations.get('curve_y_label_size', 12))
        ax.set_title('B-factor Analysis', fontsize=14)
        
        # Set ticks
        ax.tick_params(axis='both', which='major', 
                      labelsize=customizations.get('curve_tick_size', 10))
        
        # Set tick gaps
        x_tick_gap = customizations.get('curve_x_tick_gap', 10)
        y_tick_gap = customizations.get('curve_y_tick_gap', 0.1)
        
        x_min, x_max = min(residues), max(residues)
        xticks = np.arange(x_min, x_max + 1, x_tick_gap)
        ax.set_xticks(xticks)
        
        y_min, y_max = min(mean_bfactors), max(mean_bfactors)
        yticks = np.arange(0, y_max + y_tick_gap, y_tick_gap)
        ax.set_yticks(yticks)
        
        # Rotate x-axis labels if specified
        if customizations.get('curve_x_tick_rotation', 0) != 0:
            plt.setp(ax.get_xticklabels(), rotation=customizations.get('curve_x_tick_rotation'))
        
        # Set axis limits if provided
        if customizations.get('curve_x_min') is not None and customizations.get('curve_x_max') is not None:
            ax.set_xlim(customizations.get('curve_x_min'), customizations.get('curve_x_max'))
        if customizations.get('curve_y_min') is not None and customizations.get('curve_y_max') is not None:
            ax.set_ylim(customizations.get('curve_y_min'), customizations.get('curve_y_max'))
        
        ax.grid(True, alpha=0.3)
        plt.tight_layout()
        
        # Save plot to base64 string
        buffer = io.BytesIO()
        plt.savefig(
            buffer, 
            format='png', 
            dpi=customizations.get('dpi', 300),
            bbox_inches='tight',
            facecolor='white'
        )
        buffer.seek(0)
        
        # Convert to base64
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close(fig)
        
        return f"data:image/png;base64,{image_base64}"
        
    except Exception as e:
        plt.close('all')
        raise HTTPException(status_code=500, detail=f"Error plotting B-factor curve: {str(e)}")

def plot_bfactor_distribution(residue_data, customizations):
    """Plot B-factor distribution"""
    try:
        mean_bfactors = [data['mean_bfactor'] for data in residue_data]
        
        fig, ax = plt.subplots(figsize=(8, 6))
        
        # Create histogram/density plot
        ax.hist(mean_bfactors, bins=30, density=True, 
               alpha=customizations.get('dist_alpha', 0.5),
               color='skyblue', edgecolor='black')
        
        # Set labels
        ax.set_xlabel(customizations.get('dist_x_label', 'B-factor'), 
                     fontsize=customizations.get('dist_x_label_size', 12))
        ax.set_ylabel(customizations.get('dist_y_label', 'Density'), 
                     fontsize=customizations.get('dist_y_label_size', 12))
        ax.set_title('B-factor Distribution', fontsize=14)
        
        # Set ticks
        ax.tick_params(axis='both', which='major', 
                      labelsize=customizations.get('dist_tick_size', 10))
        
        # Set tick gaps
        x_tick_gap = customizations.get('dist_x_tick_gap', 0.1)
        y_tick_gap = customizations.get('dist_y_tick_gap', 0.01)
        
        x_min, x_max = min(mean_bfactors), max(mean_bfactors)
        xticks = np.arange(x_min, x_max + x_tick_gap, x_tick_gap)
        ax.set_xticks(xticks)
        
        # Rotate x-axis labels if specified
        if customizations.get('dist_x_tick_rotation', 0) != 0:
            plt.setp(ax.get_xticklabels(), rotation=customizations.get('dist_x_tick_rotation'))
        
        # Set axis limits if provided
        if customizations.get('dist_x_min') is not None and customizations.get('dist_x_max') is not None:
            ax.set_xlim(customizations.get('dist_x_min'), customizations.get('dist_x_max'))
        if customizations.get('dist_y_min') is not None and customizations.get('dist_y_max') is not None:
            ax.set_ylim(customizations.get('dist_y_min'), customizations.get('dist_y_max'))
        
        ax.grid(True, alpha=0.3)
        plt.tight_layout()
        
        # Save plot to base64 string
        buffer = io.BytesIO()
        plt.savefig(
            buffer, 
            format='png', 
            dpi=customizations.get('dpi', 300),
            bbox_inches='tight',
            facecolor='white'
        )
        buffer.seek(0)
        
        # Convert to base64
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close(fig)
        
        return f"data:image/png;base64,{image_base64}"
        
    except Exception as e:
        plt.close('all')
        raise HTTPException(status_code=500, detail=f"Error plotting B-factor distribution: {str(e)}")

def parse_smiles_input(smiles_text: str) -> tuple[List[str], List[tuple[int, str, str]]]:
    """Parse SMILES input text and return valid SMILES and invalid ones with line numbers and error messages"""
    lines = smiles_text.strip().split('\n')
    valid_smiles = []
    invalid_smiles = []
    
    for i, line in enumerate(lines, 1):
        # Handle comments more carefully - only split on # if it's preceded by whitespace
        # This preserves # in SMILES notation (like C#N for nitrile groups)
        import re
        
        # Look for # that's preceded by whitespace (indicating a comment)
        comment_match = re.search(r'\s+#', line)
        if comment_match:
            smiles_part = line[:comment_match.start()].strip()
        else:
            # No comment found, use the whole line
            smiles_part = line.strip()
        
        # Skip empty lines
        if not smiles_part:
            continue
        
        # Rest of your validation code remains the same...
        error_msg = ""
        
        # Check for balanced parentheses
        open_parens = smiles_part.count('(')
        close_parens = smiles_part.count(')')
        if open_parens != close_parens:
            if open_parens > close_parens:
                error_msg = f"Missing {open_parens - close_parens} closing parenthesis"
            else:
                error_msg = f"Extra {close_parens - open_parens} closing parenthesis"
        
        # Check for balanced brackets
        open_brackets = smiles_part.count('[')
        close_brackets = smiles_part.count(']')
        if open_brackets != close_brackets:
            if open_brackets > close_brackets:
                error_msg = f"Missing {open_brackets - close_brackets} closing bracket"
            else:
                error_msg = f"Extra {close_brackets - open_brackets} closing bracket"
        
        # Attempt RDKit validation
        try:
            mol = Chem.MolFromSmiles(smiles_part)
            if mol is not None:
                valid_smiles.append(smiles_part)
                continue
            else:
                if not error_msg:
                    error_msg = "Invalid SMILES structure"
        except Exception as e:
            error_msg = f"RDKit parsing error: {str(e)}"
        
        invalid_smiles.append((i, smiles_part, error_msg))
    
    return valid_smiles, invalid_smiles

def calculate_descriptors(smiles: str) -> tuple[float, float]:
    """Calculate TPSA and WLogP for a given SMILES"""
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"Invalid SMILES: {smiles}")
    
    tpsa = Descriptors.TPSA(mol)
    wlogp = Crippen.MolLogP(mol)
    
    return tpsa, wlogp

def classify_molecule(tpsa: float, wlogp: float, tpsa_threshold: float = 140.0, wlogp_threshold: float = 5.0) -> tuple[str, str]:
    """Classify molecule based on BOILED-Egg regions"""
    # BOILED-Egg classification logic
    # Egg white (GI absorption): TPSA <= 140 and -1 <= WLogP <= 5
    # Egg yolk (Brain penetration): TPSA <= 90 and -1 <= WLogP <= 4
    
    if tpsa <= 90 and -1 <= wlogp <= 4:
        region = "Egg Yolk"
        absorption = "High brain penetration probability"
    elif tpsa <= tpsa_threshold and -1 <= wlogp <= wlogp_threshold:
        region = "Egg White"
        absorption = "High GI absorption probability"
    else:
        region = "Outside"
        absorption = "Low absorption probability"
    
    return region, absorption

def create_boiled_egg_plot(molecules_data: List[Dict[str, Any]], customizations: Dict[str, Any]) -> str:
    """Create BOILED-Egg plot and return as base64 string"""
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Set DPI
    fig.set_dpi(customizations.get('dpi', 300))
    
    # Extract data
    tpsa_values = [mol['tpsa'] for mol in molecules_data]
    wlogp_values = [mol['wlogp'] for mol in molecules_data]
    regions = [mol['region'] for mol in molecules_data]
    
    # Define colors for different regions
    colors = []
    for region in regions:
        if region == "Egg Yolk":
            colors.append('#FFD700')  # Gold for egg yolk
        elif region == "Egg White":
            colors.append('grey')  # Cornsilk for egg white
        else:
            colors.append('#FF6B6B')  # Red for outside regions
    
    # Create the plot
    scatter = ax.scatter(wlogp_values, tpsa_values, 
                        c=colors, 
                        s=customizations.get('point_size', 100),
                        alpha=0.7,
                        edgecolors='black',
                        linewidth=0.5)
    
    # Add BOILED-Egg regions if show_thresholds is True
    if customizations.get('show_thresholds', True):
        wlogp_threshold = customizations.get('wlogp_threshold', 5.0)
        tpsa_threshold = customizations.get('tpsa_threshold', 140.0)
        
        # Egg white region (GI absorption)
        egg_white = patches.Rectangle((-1, 0), 6, tpsa_threshold, 
                                     linewidth=2, edgecolor='orange', 
                                     facecolor='grey', alpha=0.1,
                                     label='GI Absorption (Egg White)')
        ax.add_patch(egg_white)
        
        # Egg yolk region (Brain penetration)
        egg_yolk = patches.Rectangle((-1, 0), 5, 90, 
                                    linewidth=2, edgecolor='darkorange', 
                                    facecolor='gold', alpha=0.2,
                                    label='Brain Penetration (Egg Yolk)')
        ax.add_patch(egg_yolk)
        
        # Add threshold lines
        ax.axhline(y=tpsa_threshold, color='red', linestyle='--', alpha=0.7, linewidth=1)
        ax.axhline(y=90, color='orange', linestyle='--', alpha=0.7, linewidth=1)
        ax.axvline(x=wlogp_threshold, color='red', linestyle='--', alpha=0.7, linewidth=1)
        ax.axvline(x=4, color='orange', linestyle='--', alpha=0.7, linewidth=1)
        ax.axvline(x=-1, color='gray', linestyle='--', alpha=0.5, linewidth=1)
    
    # Customize plot
    ax.set_xlabel(customizations.get('x_label', 'WLogP'), 
                 fontsize=customizations.get('axis_fontsize', 12))
    ax.set_ylabel(customizations.get('y_label', 'TPSA'), 
                 fontsize=customizations.get('axis_fontsize', 12))
    ax.set_title(customizations.get('title', 'BOILED-Egg Plot'), 
                fontsize=customizations.get('title_fontsize', 14))
    
    # Set axis limits if provided
    if 'x_min' in customizations and customizations['x_min'] is not None:
        ax.set_xlim(left=customizations['x_min'])
    if 'x_max' in customizations and customizations['x_max'] is not None:
        ax.set_xlim(right=customizations['x_max'])
    if 'y_min' in customizations and customizations['y_min'] is not None:
        ax.set_ylim(bottom=customizations['y_min'])
    if 'y_max' in customizations and customizations['y_max'] is not None:
        ax.set_ylim(top=customizations['y_max'])
    
    # Add grid
    ax.grid(True, alpha=0.3)
    
    # Add legend if thresholds are shown
    if customizations.get('show_thresholds', True):
        ax.legend(loc='upper right', fontsize=10)
    
    # Adjust layout
    plt.tight_layout()
    
    # Convert plot to base64 string
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=customizations.get('dpi', 300), bbox_inches='tight')
    buffer.seek(0)
    plot_data = buffer.getvalue()
    buffer.close()
    plt.close()
    
    # Encode to base64
    plot_base64 = base64.b64encode(plot_data).decode('utf-8')
    return f"data:image/png;base64,{plot_base64}"

def calculate_lipinski_descriptors(smiles: str) -> Dict[str, Any]:
    """Calculate all Lipinski-related descriptors for a given SMILES"""
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"Invalid SMILES: {smiles}")
    
    # Calculate molecular descriptors
    descriptors = {
        'smiles': smiles,
        'MW': Descriptors.MolWt(mol),
        'nBonds': mol.GetNumBonds(),
        'fChar': Chem.rdmolops.GetFormalCharge(mol),
        'nHet': Descriptors.NumHeteroatoms(mol),
        'MaxRing': max([len(ring) for ring in Chem.GetSymmSSSR(mol)]) if mol.GetRingInfo().NumRings() > 0 else 0,
        'nRing': Descriptors.RingCount(mol),
        'nRot': Descriptors.NumRotatableBonds(mol),
        'TPSA': Descriptors.TPSA(mol),
        'nHD': Descriptors.NumHDonors(mol),
        'nHA': Descriptors.NumHAcceptors(mol),
        'LogP': Crippen.MolLogP(mol),
        'LogD': Crippen.MolLogP(mol),  # Simplified - actual LogD calculation is pH dependent
        'LogS': -Descriptors.MolLogP(mol),  # Simplified solubility estimate
        'SC': Descriptors.BertzCT(mol),  # Synthetic complexity (Bertz CT)
    }
    
    # Check Lipinski's Rule of Five compliance
    violations = []
    if descriptors['MW'] > 500:
        violations.append('MW > 500')
    if descriptors['LogP'] > 5:
        violations.append('LogP > 5')
    if descriptors['nHD'] > 5:
        violations.append('nHD > 5')
    if descriptors['nHA'] > 10:
        violations.append('nHA > 10')
    
    descriptors['FollowsLipinski'] = 'Yes' if len(violations) == 0 else 'No'
    descriptors['Violations'] = '; '.join(violations) if violations else 'None'
    
    # Calculate atom distribution
    atom_counts = Counter()
    for atom in mol.GetAtoms():
        atom_counts[atom.GetSymbol()] += 1
    descriptors['AtomDistribution'] = dict(atom_counts)
    
    return descriptors

def generate_molecule_image(smiles: str, size: int = 500, dpi: int = 300) -> str:
    """Generate molecule image from SMILES and return as base64 string"""
    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return ""
        
        # Generate 2D coordinates
        from rdkit.Chem import rdDepictor
        rdDepictor.Compute2DCoords(mol)
        
        # Create drawer
        drawer = rdMolDraw2D.MolDraw2DCairo(size, size)
        drawer.SetFontSize(0.8)
        drawer.DrawMolecule(mol)
        drawer.FinishDrawing()
        
        # Get image data
        img_data = drawer.GetDrawingText()
        img_base64 = base64.b64encode(img_data).decode('utf-8')
        
        return f"data:image/png;base64,{img_base64}"
    except Exception as e:
        logger.error(f"Error generating molecule image: {str(e)}")
        return ""

def create_distribution_plot(compounds_data: List[Dict[str, Any]], dpi: int = 300) -> str:
    """Create distribution plots for key Lipinski properties"""
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    fig.set_dpi(dpi)
    
    # Extract data
    df = pd.DataFrame(compounds_data)
    
    # Plot 1: Molecular Weight distribution
    axes[0, 0].hist(df['MW'], bins=20, alpha=0.7, color='skyblue', edgecolor='black')
    axes[0, 0].axvline(x=500, color='red', linestyle='--', linewidth=2, label='Lipinski limit (500)')
    axes[0, 0].set_xlabel('Molecular Weight (Da)')
    axes[0, 0].set_ylabel('Frequency')
    axes[0, 0].set_title('Molecular Weight Distribution')
    axes[0, 0].legend()
    axes[0, 0].grid(True, alpha=0.3)
    
    # Plot 2: LogP distribution
    axes[0, 1].hist(df['LogP'], bins=20, alpha=0.7, color='lightgreen', edgecolor='black')
    axes[0, 1].axvline(x=5, color='red', linestyle='--', linewidth=2, label='Lipinski limit (5)')
    axes[0, 1].set_xlabel('LogP')
    axes[0, 1].set_ylabel('Frequency')
    axes[0, 1].set_title('LogP Distribution')
    axes[0, 1].legend()
    axes[0, 1].grid(True, alpha=0.3)
    
    # Plot 3: H-bond donors distribution
    axes[1, 0].hist(df['nHD'], bins=range(0, max(df['nHD']) + 2), alpha=0.7, color='orange', edgecolor='black')
    axes[1, 0].axvline(x=5, color='red', linestyle='--', linewidth=2, label='Lipinski limit (5)')
    axes[1, 0].set_xlabel('H-bond Donors')
    axes[1, 0].set_ylabel('Frequency')
    axes[1, 0].set_title('H-bond Donors Distribution')
    axes[1, 0].legend()
    axes[1, 0].grid(True, alpha=0.3)
    
    # Plot 4: H-bond acceptors distribution
    axes[1, 1].hist(df['nHA'], bins=range(0, max(df['nHA']) + 2), alpha=0.7, color='pink', edgecolor='black')
    axes[1, 1].axvline(x=10, color='red', linestyle='--', linewidth=2, label='Lipinski limit (10)')
    axes[1, 1].set_xlabel('H-bond Acceptors')
    axes[1, 1].set_ylabel('Frequency')
    axes[1, 1].set_title('H-bond Acceptors Distribution')
    axes[1, 1].legend()
    axes[1, 1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # Convert plot to base64 string
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=dpi, bbox_inches='tight')
    buffer.seek(0)
    plot_data = buffer.getvalue()
    buffer.close()
    plt.close()
    
    plot_base64 = base64.b64encode(plot_data).decode('utf-8')
    return f"data:image/png;base64,{plot_base64}"

def create_radar_plot(compound_data: Dict[str, Any], dpi: int = 300) -> str:
    """Create radar plot for a single compound's properties"""
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection='polar'))
    fig.set_dpi(dpi)
    
    # Define properties and their ranges for normalization
    properties = {
        'MW': {'value': compound_data['MW'], 'max': 500, 'label': 'Molecular Weight'},
        'LogP': {'value': compound_data['LogP'], 'max': 5, 'label': 'LogP'},
        'nHD': {'value': compound_data['nHD'], 'max': 5, 'label': 'H-donors'},
        'nHA': {'value': compound_data['nHA'], 'max': 10, 'label': 'H-acceptors'},
        'TPSA': {'value': compound_data['TPSA'], 'max': 140, 'label': 'TPSA'},
        'nRot': {'value': compound_data['nRot'], 'max': 10, 'label': 'Rotatable Bonds'}
    }
    
    # Prepare data
    labels = [prop['label'] for prop in properties.values()]
    values = []
    
    for prop in properties.values():
        # Normalize to 0-1 scale based on typical ranges
        normalized_value = min(prop['value'] / prop['max'], 1.0)
        values.append(normalized_value)
    
    # Number of variables
    N = len(labels)
    
    # Compute angle for each axis
    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1]  # Complete the circle
    
    # Add values to complete the circle
    values += values[:1]
    
    # Plot
    ax.plot(angles, values, 'o-', linewidth=2, label=compound_data['smiles'][:20] + '...')
    ax.fill(angles, values, alpha=0.25)
    
    # Add labels
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(labels)
    ax.set_ylim(0, 1)
    
    # Add reference circle for Lipinski compliance
    reference_values = [1.0] * (N + 1)  # All at maximum allowed values
    ax.plot(angles, reference_values, '--', color='red', alpha=0.7, label='Lipinski Limits')
    
    ax.set_title('Molecular Properties Radar Plot', size=14, y=1.08)
    ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0))
    
    plt.tight_layout()
    
    # Convert plot to base64 string
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=dpi, bbox_inches='tight')
    buffer.seek(0)
    plot_data = buffer.getvalue()
    buffer.close()
    plt.close()
    
    plot_base64 = base64.b64encode(plot_data).decode('utf-8')
    return f"data:image/png;base64,{plot_base64}"

def generate_csv_data(compounds_data: List[Dict[str, Any]]) -> str:
    """Generate CSV data from compounds analysis"""
    if not compounds_data:
        return ""
    
    # Create CSV content
    output = io.StringIO()
    fieldnames = [
        'SMILES', 'Molecular Weight (MW)', 'Number of Bonds', 'Formal Charge',
        'Number of Heteroatoms', 'Max Ring Size', 'Number of Rings',
        'Rotatable Bonds', 'TPSA', 'H-bond Donors (nHD)', 'H-bond Acceptors (nHA)',
        'LogP', 'LogD', 'LogS', 'Synthetic Complexity', 'Follows Lipinski',
        'Violations', 'Atom Distribution'
    ]
    
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    for compound in compounds_data:
        writer.writerow({
            'SMILES': compound['smiles'],
            'Molecular Weight (MW)': compound['MW'],
            'Number of Bonds': compound['nBonds'],
            'Formal Charge': compound['fChar'],
            'Number of Heteroatoms': compound['nHet'],
            'Max Ring Size': compound['MaxRing'],
            'Number of Rings': compound['nRing'],
            'Rotatable Bonds': compound['nRot'],
            'TPSA': compound['TPSA'],
            'H-bond Donors (nHD)': compound['nHD'],
            'H-bond Acceptors (nHA)': compound['nHA'],
            'LogP': compound['LogP'],
            'LogD': compound['LogD'],
            'LogS': compound['LogS'],
            'Synthetic Complexity': compound['SC'],
            'Follows Lipinski': compound['FollowsLipinski'],
            'Violations': compound['Violations'],
            'Atom Distribution': json.dumps(compound['AtomDistribution'])
        })
    
    return output.getvalue()

def create_tanimoto_heatmap(similarity_matrix, color_scheme="Blues", dpi=300):
    """Create a heatmap visualization of the Tanimoto similarity matrix"""
    
    try:
        plt.style.use('default')
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Create mask for upper triangle to avoid duplication
        mask = np.triu(np.ones_like(similarity_matrix), k=1)
        
        # Create heatmap
        sns.heatmap(similarity_matrix, 
                    mask=mask,
                    cmap=color_scheme,
                    vmin=0,
                    vmax=1,
                    annot=False,
                    square=True,
                    cbar_kws={'label': 'Tanimoto Coefficient'},
                    ax=ax)
        
        # Add labels
        num_compounds = similarity_matrix.shape[0]
        ax.set_xticks(range(num_compounds))
        ax.set_yticks(range(num_compounds))
        ax.set_xticklabels([f'Compound {i+1}' for i in range(num_compounds)], rotation=45)
        ax.set_yticklabels([f'Compound {i+1}' for i in range(num_compounds)], rotation=0)
        
        ax.set_title('Tanimoto Similarity Matrix', fontsize=14, fontweight='bold', pad=20)
        
        plt.tight_layout()
        
        # Convert to base64
        img_buffer = BytesIO()
        plt.savefig(img_buffer, format='png', dpi=dpi, bbox_inches='tight', 
                   facecolor='white', edgecolor='none')
        img_buffer.seek(0)
        
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        plt.close(fig)
        
        return f"data:image/png;base64,{img_base64}"
        
    except Exception as e:
        logger.error(f"Error creating Tanimoto heatmap: {str(e)}")
        raise Exception(f"Could not generate heatmap: {str(e)}")


def pil_to_base64(pil_image, dpi=300):
    """Convert PIL image to base64 string"""
    try:
        img_buffer = BytesIO()
        pil_image.save(img_buffer, format='PNG', dpi=(dpi, dpi))
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        return f"data:image/png;base64,{img_base64}"
    except Exception as e:
        logger.error(f"Error converting PIL image to base64: {str(e)}")
        return None
                        
@app.post("/api/rmsd/")
async def rmsd_analysis(files: List[UploadFile] = File(...), labels: List[str] = Form(None)):
    all_x_data = []
    all_y_data = []
    file_labels = []
    
    for i, file in enumerate(files):
        content = await file.read()
        x_data, y_data = parse_xvg(content)
        all_x_data.append(x_data)
        all_y_data.append(y_data)
        
        if labels and i < len(labels) and labels[i]:
            file_labels.append(labels[i])
        else:
            file_labels.append(file.filename)
    
    return {
        "all_x_data": all_x_data,
        "all_y_data": all_y_data,
        "labels": file_labels
    }

@app.post("/api/dccm/")
async def dccm_analysis(
    pdb_file: UploadFile = File(...),
    xtc_file: UploadFile = File(...),
    colorMap: str = Form("viridis"),
    minValue: float = Form(-1.0),
    maxValue: float = Form(1.0),
    xAxisLabel: str = Form("Residue index"),
    yAxisLabel: str = Form("Residue index"),
    plotTitle: str = Form("Dynamic Cross-Correlation Matrix"),
    showColorbar: bool = Form(True),
    colorbarLabel: str = Form("Correlation Coefficient"),
    dpi: int = Form(300)
):
    """Calculate and plot DCCM from uploaded PDB and XTC files"""
    
    # Create temporary files
    pdb_temp = None
    xtc_temp = None
    
    try:
        # Validate file types
        if not pdb_file.filename.lower().endswith('.pdb'):
            raise HTTPException(status_code=400, detail="PDB file must have .pdb extension")
        
        if not xtc_file.filename.lower().endswith('.xtc'):
            raise HTTPException(status_code=400, detail="XTC file must have .xtc extension")
        
        # Create temporary files
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdb') as pdb_temp:
            pdb_content = await pdb_file.read()
            pdb_temp.write(pdb_content)
            pdb_temp_path = pdb_temp.name
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xtc') as xtc_temp:
            xtc_content = await xtc_file.read()
            xtc_temp.write(xtc_content)
            xtc_temp_path = xtc_temp.name
        
        # Calculate DCCM
        dccm = calculate_dccm(pdb_temp_path, xtc_temp_path)
        
        # Prepare plotting customizations
        customizations = {
            'colorMap': colorMap,
            'minValue': minValue,
            'maxValue': maxValue,
            'xAxisLabel': xAxisLabel,
            'yAxisLabel': yAxisLabel,
            'plotTitle': plotTitle,
            'showColorbar': showColorbar,
            'colorbarLabel': colorbarLabel,
            'dpi': dpi
        }
        
        # Generate plot
        plot_url = plot_dccm(dccm, customizations)
        
        return {
            "success": True,
            "plotUrl": plot_url,
            "dccm_shape": dccm.shape,
            "message": "DCCM calculated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
    finally:
        # Clean up temporary files
        try:
            if pdb_temp_path and os.path.exists(pdb_temp_path):
                os.remove(pdb_temp_path)
            if xtc_temp_path and os.path.exists(xtc_temp_path):
                os.remove(xtc_temp_path)
        except Exception as cleanup_error:
            print(f"Warning: Could not clean up temporary files: {cleanup_error}")

@app.post("/api/pca/")
async def pca_analysis(
    pdb_file: UploadFile = File(...),
    xtc_file: UploadFile = File(...),
    method: str = Form("pca"),
    selection: str = Form("backbone"),
    stride: int = Form(1),
    n_components: int = Form(10),
    comp1: int = Form(0),
    comp2: int = Form(1),
    dpi: int = Form(300)
):
    """Perform PCA, t-SNE, or UMAP analysis on MD trajectory"""
    
    pdb_temp_path = None
    xtc_temp_path = None
    
    try:
        # Validate file types
        if not pdb_file.filename.lower().endswith('.pdb'):
            raise HTTPException(status_code=400, detail="PDB file must have .pdb extension")
        
        if not xtc_file.filename.lower().endswith('.xtc'):
            raise HTTPException(status_code=400, detail="XTC file must have .xtc extension")
        
        # Create temporary files
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdb') as pdb_temp:
            pdb_content = await pdb_file.read()
            pdb_temp.write(pdb_content)
            pdb_temp_path = pdb_temp.name
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xtc') as xtc_temp:
            xtc_content = await xtc_file.read()
            xtc_temp.write(xtc_content)
            xtc_temp_path = xtc_temp.name
        
        # Perform analysis based on method
        if method.lower() == 'pca':
            result = perform_pca_analysis(
                pdb_temp_path, xtc_temp_path, selection, stride, n_components, comp1, comp2
            )
            # Generate variance plot
            variance_plot = plot_variance_explained(
                result['explained_variance'], result['cumulative_variance'], dpi
            )
        elif method.lower() == 'tsne':
            result = perform_tsne_analysis(
                pdb_temp_path, xtc_temp_path, selection, stride, 2
            )
            variance_plot = None
        elif method.lower() == 'umap':
            result = perform_umap_analysis(
                pdb_temp_path, xtc_temp_path, selection, stride, 2
            )
            variance_plot = None
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported method: {method}")
        
        # Generate projection plot
        projection_plot = plot_projection(
            result['transformed'], comp1, comp2, method.upper(), dpi
        )
        
        return {
            "variance_plot": variance_plot,
            "projection_plot": projection_plot,
            "method": method.upper(),
            "n_frames": result['n_frames'],
            "n_atoms": result['n_atoms'],
            "comp1": comp1,
            "comp2": comp2,
            "n_components_70": result.get('n_components_70', None),
            "component_options": result.get('component_options', []),
            "explained_variance": result.get('explained_variance'),
            "cumulative_variance": result.get('cumulative_variance')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
    finally:
        # Clean up temporary files
        try:
            if pdb_temp_path and os.path.exists(pdb_temp_path):
                os.remove(pdb_temp_path)
            if xtc_temp_path and os.path.exists(xtc_temp_path):
                os.remove(xtc_temp_path)
        except Exception as cleanup_error:
            print(f"Warning: Could not clean up temporary files: {cleanup_error}")

@app.post("/api/ramachandran/")
async def generate_ramachandran_plot_endpoint( 
    pdb_file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    xlabel: Optional[str] = Form(None),
    ylabel: Optional[str] = Form(None),
    fontsize: Optional[float] = Form(None),
    dpi: Optional[int] = Form(None),
    cmap: Optional[str] = Form(None),
    alpha: Optional[float] = Form(None)
):
    """Generate Ramachandran plot using ramachandraw library"""
    
    pdb_temp_path = None
    
    try:
        # Validate file type
        if not pdb_file.filename.lower().endswith('.pdb'):
            raise HTTPException(status_code=400, detail="File must have .pdb extension")
        
        # Create temporary file for PDB data
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdb') as pdb_temp:
            pdb_content = await pdb_file.read()
            pdb_temp.write(pdb_content)
            pdb_temp_path = pdb_temp.name
        
        # Prepare customizations for ramachandraw
        customizations = {
            'cmap': cmap or 'viridis',
            'alpha': alpha or 0.75,
            'dpi': dpi or 300,
            'title': title,
            'xlabel': xlabel,
            'ylabel': ylabel,
            'fontsize': fontsize
        }
        
        # Generate the plot using ramachandraw
        plot_base64 = generate_ramachandran_plot(pdb_temp_path, customizations)
        
        # Extract basic statistics (optional, since ramachandraw handles the main functionality)
        statistics = extract_basic_statistics(pdb_temp_path)
        
        # Since ramachandraw doesn't provide detailed residue data, we'll return basic info
        residue_data = []  # ramachandraw handles this internally
        
        return {
            "plot": plot_base64,
            "residue_data": residue_data,
            "statistics": statistics,
            "customizations_applied": customizations
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
    finally:
        # Clean up temporary PDB file
        try:
            if pdb_temp_path and os.path.exists(pdb_temp_path):
                os.remove(pdb_temp_path)
        except Exception as cleanup_error:
            print(f"Warning: Could not clean up temporary file: {cleanup_error}")

@app.post("/api/contact_map/")
async def contact_map_analysis(
    pdb_file: UploadFile = File(...),
    cutoff: float = Form(8.0),
    cmap: str = Form("viridis"),
    vmin: float = Form(0.0),
    vmax: float = Form(1.0),
    xlabel: str = Form("Residue Index"),
    ylabel: str = Form("Residue Index"),
    xticks_gap: int = Form(10),
    yticks_gap: int = Form(10),
    xlim_min: Optional[int] = Form(None),
    xlim_max: Optional[int] = Form(None),
    ylim_min: Optional[int] = Form(None),
    ylim_max: Optional[int] = Form(None),
    label_fontsize: int = Form(15),
    tick_labelsize: int = Form(12),
    dpi: int = Form(300)
):
    """Calculate and plot contact map from uploaded PDB file"""
    
    pdb_temp_path = None
    
    try:
        # Validate file type
        if not pdb_file.filename.lower().endswith('.pdb'):
            raise HTTPException(status_code=400, detail="PDB file must have .pdb extension")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdb') as pdb_temp:
            pdb_content = await pdb_file.read()
            pdb_temp.write(pdb_content)
            pdb_temp_path = pdb_temp.name
        
        # Calculate contact map
        contact_matrix, residue_count = calculate_contact_map(pdb_temp_path, cutoff)
        
        # Prepare plotting customizations
        customizations = {
            'cmap': cmap,
            'vmin': vmin,
            'vmax': vmax,
            'xlabel': xlabel,
            'ylabel': ylabel,
            'xticks_gap': xticks_gap,
            'yticks_gap': yticks_gap,
            'xlim_min': xlim_min,
            'xlim_max': xlim_max,
            'ylim_min': ylim_min,
            'ylim_max': ylim_max,
            'label_fontsize': label_fontsize,
            'tick_labelsize': tick_labelsize,
            'dpi': dpi
        }
        
        # Generate plot
        plot_url = plot_contact_map(contact_matrix, customizations)
        
        return {
            "success": True,
            "plot": plot_url,
            "matrix": contact_matrix.tolist(),
            "residue_count": residue_count,
            "message": "Contact map calculated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
    finally:
        # Clean up temporary file
        try:
            if pdb_temp_path and os.path.exists(pdb_temp_path):
                os.remove(pdb_temp_path)
        except Exception as cleanup_error:
            print(f"Warning: Could not clean up temporary file: {cleanup_error}")

@app.post("/api/bfactor")
async def bfactor_analysis(
    pdb_file: UploadFile = File(...),
    show_std_dev: bool = Form(False),
    # Curve plot customizations
    curve_x_label: str = Form("Residue Number"),
    curve_y_label: str = Form("B-factor Mean"),
    curve_x_label_size: int = Form(12),
    curve_y_label_size: int = Form(12),
    curve_tick_size: int = Form(10),
    curve_x_tick_gap: int = Form(10),
    curve_y_tick_gap: float = Form(0.1),
    curve_linewidth: float = Form(1.5),
    curve_x_tick_rotation: int = Form(0),
    curve_x_min: Optional[int] = Form(None),
    curve_x_max: Optional[int] = Form(None),
    curve_y_min: Optional[float] = Form(None),
    curve_y_max: Optional[float] = Form(None),
    # Distribution plot customizations
    dist_x_label: str = Form("B-factor"),
    dist_y_label: str = Form("Density"),
    dist_x_label_size: int = Form(12),
    dist_y_label_size: int = Form(12),
    dist_tick_size: int = Form(10),
    dist_x_tick_gap: float = Form(0.1),
    dist_y_tick_gap: float = Form(0.01),
    dist_x_tick_rotation: int = Form(0),
    dist_alpha: float = Form(0.5),
    dist_x_min: Optional[float] = Form(None),
    dist_x_max: Optional[float] = Form(None),
    dist_y_min: Optional[float] = Form(None),
    dist_y_max: Optional[float] = Form(None),
    dpi: int = Form(300)
):
    """Analyze B-factors from uploaded PDB file"""
    
    pdb_temp_path = None
    
    try:
        # Validate file type
        if not pdb_file.filename.lower().endswith('.pdb'):
            raise HTTPException(status_code=400, detail="PDB file must have .pdb extension")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdb') as pdb_temp:
            pdb_content = await pdb_file.read()
            pdb_temp.write(pdb_content)
            pdb_temp_path = pdb_temp.name
        
        # Analyze B-factors
        residue_data, residue_count = analyze_bfactors(pdb_temp_path)
        
        # Prepare curve plot customizations
        curve_customizations = {
            'curve_x_label': curve_x_label,
            'curve_y_label': curve_y_label,
            'curve_x_label_size': curve_x_label_size,
            'curve_y_label_size': curve_y_label_size,
            'curve_tick_size': curve_tick_size,
            'curve_x_tick_gap': curve_x_tick_gap,
            'curve_y_tick_gap': curve_y_tick_gap,
            'curve_linewidth': curve_linewidth,
            'curve_x_tick_rotation': curve_x_tick_rotation,
            'curve_x_min': curve_x_min,
            'curve_x_max': curve_x_max,
            'curve_y_min': curve_y_min,
            'curve_y_max': curve_y_max,
            'dpi': dpi
        }
        
        # Prepare distribution plot customizations
        dist_customizations = {
            'dist_x_label': dist_x_label,
            'dist_y_label': dist_y_label,
            'dist_x_label_size': dist_x_label_size,
            'dist_y_label_size': dist_y_label_size,
            'dist_tick_size': dist_tick_size,
            'dist_x_tick_gap': dist_x_tick_gap,
            'dist_y_tick_gap': dist_y_tick_gap,
            'dist_x_tick_rotation': dist_x_tick_rotation,
            'dist_alpha': dist_alpha,
            'dist_x_min': dist_x_min,
            'dist_x_max': dist_x_max,
            'dist_y_min': dist_y_min,
            'dist_y_max': dist_y_max,
            'dpi': dpi
        }
        
        # Generate plots
        curve_plot_url = plot_bfactor_curve(residue_data, show_std_dev, curve_customizations)
        dist_plot_url = plot_bfactor_distribution(residue_data, dist_customizations)
        
        return {
            "curve_plot": curve_plot_url,
            "dist_plot": dist_plot_url,
            "residue_data": residue_data,
            "residue_count": residue_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
    finally:
        # Clean up temporary file
        try:
            if pdb_temp_path and os.path.exists(pdb_temp_path):
                os.remove(pdb_temp_path)
        except Exception as cleanup_error:
            print(f"Warning: Could not clean up temporary file: {cleanup_error}")

@app.post("/api/boiled")
async def boiled_egg_analysis(
    smiles: str = Form(...),
    title: str = Form("BOILED-Egg Plot"),
    x_label: str = Form("WLogP"),
    y_label: str = Form("TPSA"),
    point_size: int = Form(100),
    show_thresholds: bool = Form(True),
    wlogp_threshold: float = Form(5.0),
    tpsa_threshold: float = Form(140.0),
    label_fontsize: int = Form(9),
    axis_fontsize: int = Form(12),
    title_fontsize: int = Form(14),
    dpi: int = Form(300)
):
    """Analyze SMILES for BOILED-Egg prediction"""
    
    try:
        # Debug: Log the received SMILES
        logger.info(f"Received SMILES input (length: {len(smiles)}):")
        logger.info(f"Raw SMILES: {repr(smiles)}")
        
        # Check if SMILES contains the complete molecule you mentioned
        if "C#N" in smiles:
            logger.info("Found nitrile group (C#N) in SMILES - molecule appears complete")
        else:
            logger.warning("Nitrile group (C#N) not found - SMILES may be truncated")
        # Parse SMILES input
        valid_smiles, invalid_smiles = parse_smiles_input(smiles)
        
        # Debug: Log parsed results
        logger.info(f"Parsed results: {len(valid_smiles)} valid, {len(invalid_smiles)} invalid")
        for i, valid_smi in enumerate(valid_smiles):
            logger.info(f"Valid SMILES {i+1}: {valid_smi}")
        
        # Log details for debugging
        logger.info(f"Processing {len(valid_smiles)} valid SMILES, {len(invalid_smiles)} invalid SMILES")
        
        if invalid_smiles:
            for line_num, smiles_str, error_msg in invalid_smiles:
                logger.warning(f"Line {line_num}: Invalid SMILES '{smiles_str}' - {error_msg}")
                # Additional debugging for your specific SMILES
                if smiles_str.startswith("C[C@]1(C=CSC(=N1)N)"):
                    logger.info(f"Found your target molecule (truncated): {smiles_str}")
                    logger.info(f"Length: {len(smiles_str)}, Expected length: ~70+")
        
        if not valid_smiles:
            # Provide detailed error message
            error_details = []
            for line_num, smiles_str, error_msg in invalid_smiles:
                error_details.append(f"Line {line_num}: {error_msg}")
            
            raise HTTPException(
                status_code=400, 
                detail={
                    "message": "No valid SMILES found in input",
                    "errors": error_details,
                    "invalid_smiles": [{"line": line_num, "smiles": smiles_str, "error": error_msg} for line_num, smiles_str, error_msg in invalid_smiles]
                }
            )
        
        # Process molecules
        molecules_data = []
        for i, smiles_str in enumerate(valid_smiles, 1):
            try:
                tpsa, wlogp = calculate_descriptors(smiles_str)
                region, absorption = classify_molecule(tpsa, wlogp, tpsa_threshold, wlogp_threshold)
                
                molecules_data.append({
                    'id': i,
                    'smiles': smiles_str,
                    'tpsa': tpsa,
                    'wlogp': wlogp,
                    'region': region,
                    'absorption': absorption
                })
            except Exception as e:
                logger.error(f"Error processing SMILES {smiles_str}: {str(e)}")
                continue
        
        if not molecules_data:
            raise HTTPException(status_code=400, detail="No molecules could be processed successfully")
        
        # Prepare customizations
        customizations = {
            'title': title,
            'x_label': x_label,
            'y_label': y_label,
            'point_size': point_size,
            'show_thresholds': show_thresholds,
            'wlogp_threshold': wlogp_threshold,
            'tpsa_threshold': tpsa_threshold,
            'label_fontsize': label_fontsize,
            'axis_fontsize': axis_fontsize,
            'title_fontsize': title_fontsize,
            'dpi': dpi
        }
        
        # Generate plot
        plot_url = create_boiled_egg_plot(molecules_data, customizations)
        
        return JSONResponse({
            "plot": plot_url,
            "molecules": molecules_data,
            "invalid_smiles": [{"line": line_num, "smiles": smiles_str, "error": error_msg} for line_num, smiles_str, error_msg in invalid_smiles],
            "valid_count": len(valid_smiles),
            "invalid_count": len(invalid_smiles)
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in BOILED-Egg analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/api/lipinski")
async def lipinski_analysis(
    smiles_list: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    image_size: int = Form(500),
    dpi: int = Form(300)
):
    """Analyze SMILES for Lipinski Rule of Five compliance"""
    
    try:
        valid_smiles = []
        invalid_smiles = []
        
        if file:
            # Process uploaded file
            logger.info(f"Processing uploaded file: {file.filename}")
            content = await file.read()
            smiles_text = content.decode('utf-8')
            valid_smiles, invalid_smiles = parse_smiles_input(smiles_text)
        elif smiles_list:
            # Process SMILES list from form
            logger.info("Processing SMILES list from form")
            smiles_array = json.loads(smiles_list)
            smiles_text = '\n'.join(smiles_array)
            valid_smiles, invalid_smiles = parse_smiles_input(smiles_text)
        else:
            raise HTTPException(status_code=400, detail="No SMILES input provided")
        
        logger.info(f"Parsed results: {len(valid_smiles)} valid, {len(invalid_smiles)} invalid")
        
        if not valid_smiles:
            error_details = []
            for line_num, smiles_str, error_msg in invalid_smiles:
                error_details.append(f"Line {line_num}: {error_msg}")
            
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "No valid SMILES found in input",
                    "errors": error_details,
                    "invalid_smiles": [{"line": line_num, "smiles": smiles_str, "error": error_msg} for line_num, smiles_str, error_msg in invalid_smiles]
                }
            )
        
        # Process compounds
        compounds_data = []
        for smiles_str in valid_smiles:
            try:
                descriptors = calculate_lipinski_descriptors(smiles_str)
                
                # Generate molecule image
                if image_size > 0:
                    descriptors['moleculeImage'] = generate_molecule_image(smiles_str, image_size, dpi)
                
                compounds_data.append(descriptors)
            except Exception as e:
                logger.error(f"Error processing SMILES {smiles_str}: {str(e)}")
                continue
        
        if not compounds_data:
            raise HTTPException(status_code=400, detail="No molecules could be processed successfully")
        
        # Generate distribution plot for multiple compounds
        distribution_plot = None
        if len(compounds_data) > 1:
            distribution_plot = create_distribution_plot(compounds_data, dpi)
        
        # Generate CSV data
        csv_data = generate_csv_data(compounds_data)
        
        return JSONResponse({
            "compounds": compounds_data,
            "distribution_plot": distribution_plot,
            "csv_data": csv_data,
            "invalid_smiles": [{"line": line_num, "smiles": smiles_str, "error": error_msg} for line_num, smiles_str, error_msg in invalid_smiles],
            "valid_count": len(valid_smiles),
            "invalid_count": len(invalid_smiles)
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in Lipinski analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/api/lipinski_radar")
async def lipinski_radar_plot(
    compound_data: str = Form(...),
    dpi: int = Form(300)
):
    """Generate radar plot for a single compound"""
    
    try:
        compound = json.loads(compound_data)
        radar_plot = create_radar_plot(compound, dpi)
        
        return JSONResponse({
            "radar_plot": radar_plot
        })
        
    except Exception as e:
        logger.error(f"Error generating radar plot: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating radar plot: {str(e)}")

@app.post("/api/tanimoto")
async def tanimoto_pairwise(
    smiles1: str = Form(...),
    smiles2: str = Form(...),
    dpi: int = Form(300)
):
    """Calculate pairwise Tanimoto similarity between two SMILES"""
    
    try:
        logger.info(f"Calculating pairwise Tanimoto similarity for: {smiles1} vs {smiles2}")
        
        # Parse molecules
        mol1 = Chem.MolFromSmiles(smiles1)
        mol2 = Chem.MolFromSmiles(smiles2)
        
        if mol1 is None:
            raise HTTPException(status_code=400, detail=f"Invalid SMILES for molecule 1: {smiles1}")
        if mol2 is None:
            raise HTTPException(status_code=400, detail=f"Invalid SMILES for molecule 2: {smiles2}")
        
        # Generate fingerprints
        fp1 = AllChem.GetMorganFingerprintAsBitVect(mol1, 2, nBits=2048)
        fp2 = AllChem.GetMorganFingerprintAsBitVect(mol2, 2, nBits=2048)
        
        # Calculate Tanimoto similarity
        similarity = DataStructs.TanimotoSimilarity(fp1, fp2)
        
        # Find Maximum Common Substructure (MCS)
        mol1_image = None
        mol2_image = None
        has_mcs = False
        
        try:
            mcs = rdFMCS.FindMCS([mol1, mol2])
            
            if mcs.numAtoms > 0:
                # Get the SMARTS pattern for the MCS
                mcs_mol = Chem.MolFromSmarts(mcs.smartsString)
                
                # Create match objects
                matches1 = mol1.GetSubstructMatch(mcs_mol)
                matches2 = mol2.GetSubstructMatch(mcs_mol)
                
                # Generate 2D depictions with highlighted substructures
                img1 = Draw.MolToImage(mol1, highlightAtoms=matches1, size=(400, 400))
                img2 = Draw.MolToImage(mol2, highlightAtoms=matches2, size=(400, 400))
                
                # Convert to base64
                mol1_image = pil_to_base64(img1, dpi)
                mol2_image = pil_to_base64(img2, dpi)
                has_mcs = True
                
        except Exception as mcs_error:
            logger.warning(f"Could not find MCS: {str(mcs_error)}")
            # Generate regular molecule images without highlighting
            img1 = Draw.MolToImage(mol1, size=(400, 400))
            img2 = Draw.MolToImage(mol2, size=(400, 400))
            mol1_image = pil_to_base64(img1, dpi)
            mol2_image = pil_to_base64(img2, dpi)
        
        logger.info(f"Tanimoto similarity calculated: {similarity:.3f}")
        
        return JSONResponse({
            "similarity": round(similarity, 4),
            "mol1_image": mol1_image,
            "mol2_image": mol2_image,
            "has_mcs": has_mcs
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in Tanimoto pairwise calculation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calculating similarity: {str(e)}")


@app.post("/api/tanimoto_matrix")
async def tanimoto_matrix(
    smiles_list: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    color_scheme: str = Form("Blues"),
    dpi: int = Form(300)
):
    """Calculate Tanimoto similarity matrix for multiple SMILES"""
    
    try:
        valid_smiles = []
        invalid_smiles = []
        
        if file:
            # Process uploaded file
            logger.info(f"Processing uploaded file: {file.filename}")
            content = await file.read()
            smiles_text = content.decode('utf-8')
            valid_smiles, invalid_smiles = parse_smiles_input(smiles_text)
        elif smiles_list:
            # Process SMILES list from form
            logger.info("Processing SMILES list from form")
            smiles_array = json.loads(smiles_list)
            smiles_text = '\n'.join(smiles_array)
            valid_smiles, invalid_smiles = parse_smiles_input(smiles_text)
        else:
            raise HTTPException(status_code=400, detail="No SMILES input provided")
        
        logger.info(f"Parsed results: {len(valid_smiles)} valid, {len(invalid_smiles)} invalid")
        
        if not valid_smiles:
            error_details = []
            for line_num, smiles_str, error_msg in invalid_smiles:
                error_details.append(f"Line {line_num}: {error_msg}")
            
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "No valid SMILES found in input",
                    "errors": error_details,
                    "invalid_smiles": [{"line": line_num, "smiles": smiles_str, "error": error_msg} for line_num, smiles_str, error_msg in invalid_smiles]
                }
            )
        
        if len(valid_smiles) < 2:
            raise HTTPException(status_code=400, detail="At least 2 valid SMILES required for matrix calculation")
        
        # Parse molecules and generate fingerprints
        mols = []
        fps = []
        valid_indices = []
        
        for i, smiles_str in enumerate(valid_smiles):
            try:
                mol = Chem.MolFromSmiles(smiles_str)
                if mol is not None:
                    fp = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=2048)
                    mols.append(mol)
                    fps.append(fp)
                    valid_indices.append(i)
                else:
                    logger.warning(f"Could not parse SMILES: {smiles_str}")
            except Exception as e:
                logger.warning(f"Error processing SMILES {smiles_str}: {str(e)}")
                continue
        
        if len(fps) < 2:
            raise HTTPException(status_code=400, detail="Not enough valid molecules for matrix calculation")
        
        # Calculate similarity matrix
        n = len(fps)
        similarity_matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(n):
                similarity = DataStructs.TanimotoSimilarity(fps[i], fps[j])
                similarity_matrix[i, j] = similarity
        
        # Generate heatmap
        heatmap = create_tanimoto_heatmap(similarity_matrix, color_scheme, dpi)
        
        # Convert matrix to list for JSON serialization
        matrix_list = similarity_matrix.tolist()
        
        # Get the corresponding valid SMILES
        valid_smiles_subset = [valid_smiles[i] for i in valid_indices]
        
        logger.info(f"Generated similarity matrix of size {n}x{n}")
        
        return JSONResponse({
            "similarity_matrix": matrix_list,
            "heatmap": heatmap,
            "smiles_list": valid_smiles_subset,
            "valid_indices": valid_indices,
            "invalid_smiles": [{"line": line_num, "smiles": smiles_str, "error": error_msg} for line_num, smiles_str, error_msg in invalid_smiles]
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in Tanimoto matrix calculation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calculating similarity matrix: {str(e)}")
                        
@app.get("/")
async def root():
    return {"message": "MD Analysis API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
