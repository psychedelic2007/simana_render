from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import matplotlib.pyplot as plt
import numpy as np
import tempfile
import os
import sys
from itertools import combinations
from typing import Optional

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import RamachandranPlotter
from ramachandran.RamachandranPlotter import main as RamachandranPlotter

try:
    import RamachanDraw
except ImportError:
    print("RamachanDraw not installed. Install with: pip install ramachandraw")

try:
    import MDAnalysis as mda
    from MDAnalysis.analysis.align import alignto
    MDAnalysis_INSTALLED = True
except ImportError:
    MDAnalysis_INSTALLED = False
    print("MDAnalysis not installed. Install with: pip install MDAnalysis")

try:
    from Bio.PDB import PDBParser
    BIOPYTHON_INSTALLED = True
except ImportError:
    BIOPYTHON_INSTALLED = False
    print("Biopython not installed. Install with: pip install biopython")

try:
    import seaborn as sns
    SEABORN_INSTALLED = True
except ImportError:
    SEABORN_INSTALLED = False
    print("Seaborn not installed. Install with: pip install seaborn")

try:
    from rdkit import Chem
    from rdkit.Chem import Descriptors
    RDKIT_INSTALLED = True
except ImportError:
    RDKIT_INSTALLED = False
    print("RDKit not installed. Install with: pip install rdkit-pypi")

try:
    from sklearn.decomposition import PCA
    from sklearn.manifold import TSNE
    SKLEARN_INSTALLED = True
except ImportError:
    SKLEARN_INSTALLED = False
    print("scikit-learn not installed. Install with: pip install scikit-learn")

try:
    from umap import UMAP
    UMAP_INSTALLED = True
except ImportError:
    UMAP_INSTALLED = False
    print("UMAP not installed. Install with: pip install umap-learn")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "SimAna API is running"}

@app.post("/api/ramachandran")
async def generate_ramachandran_plot(
    pdb_file: UploadFile = File(None),
    plot_type: str = "0",
    iter_models: bool = False,
    model_number: str = "0",
    iter_chains: bool = False,
    chain_id: str = "A",
    save_csv: bool = False,
    file_type: str = "png"
):
    try:
        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # If no file is uploaded, use a default PDB file
            if pdb_file is None:
                pdb_path = os.path.join(temp_dir, "default.pdb")
                with open(pdb_path, "w") as f:
                    f.write("""ATOM      1  N   ALA A   1       0.000   0.000   0.000  1.00  0.00           N
ATOM      2  CA  ALA A   1       1.458   0.000   0.000  1.00  0.00           C
ATOM      3  C   ALA A   1       2.009   1.420   0.000  1.00  0.00           C
ATOM      4  O   ALA A   1       1.251   2.390   0.000  1.00  0.00           O
ATOM      5  CB  ALA A   1       1.988  -0.773  -1.232  1.00  0.00           C""")
            else:
                # Save uploaded file to temporary directory
                pdb_path = os.path.join(temp_dir, pdb_file.filename)
                with open(pdb_path, "wb") as f:
                    f.write(await pdb_file.read())

            # Generate the plot
            plot_name = os.path.basename(pdb_path).replace(".pdb", "")
            plot_path = os.path.join(temp_dir, f"{plot_name}_AllRamachandranPlot.{file_type}")
            
            # Convert model number to integer
            try:
                model_num = int(model_number)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid model number. Must be an integer.")

            # Run the Ramachandran plotter
            RamachandranPlotter(
                pdb=pdb_path,
                itmod=iter_models,
                model_num=model_num,  # Use the converted integer
                itchain=iter_chains,
                chain_num=chain_id,
                plot_type=plot_type,
                out_dir=temp_dir,
                verb=False,
                save=save_csv,
                file_type=file_type
            )

            # Read the generated plot
            with open(plot_path, "rb") as f:
                plot_data = base64.b64encode(f.read()).decode()

            # If CSV was requested, read it
            csv_data = None
            if save_csv:
                csv_path = os.path.join(temp_dir, f"{plot_name}_AllRamachandranPlot.csv")
                with open(csv_path, "rb") as f:
                    csv_data = base64.b64encode(f.read()).decode()

            return {
                "plot": f"data:image/{file_type};base64,{plot_data}",
                "file_type": file_type,
                "csv": csv_data
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/dccm")
async def generate_dccm(
    pdb_file: UploadFile = File(...),
    xtc_file: UploadFile = File(...),
    cmap: str = Form("viridis"),
    vmin: float = Form(-1.0),
    vmax: float = Form(1.0),
    xlabel: str = Form("Residue index"),
    ylabel: str = Form("Residue index"),
    title: str = Form("Dynamic Cross-Correlation Matrix"),
    colorbar_label: str = Form("Correlation Coefficient"),
    dpi: int = Form(300)
):
    try:
        # Check if MDAnalysis is installed
        if not MDAnalysis_INSTALLED:
            return {"error": "MDAnalysis not installed on the server"}
        
        # Save uploaded files to temporary locations
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdb") as pdb_temp:
            pdb_temp_path = pdb_temp.name
            contents = await pdb_file.read()
            pdb_temp.write(contents)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xtc") as xtc_temp:
            xtc_temp_path = xtc_temp.name
            contents = await xtc_file.read()
            xtc_temp.write(contents)
        
        # Calculate DCCM
        try:
            u = mda.Universe(pdb_temp_path, xtc_temp_path)
            ca_atoms = u.select_atoms('name CA')
            alignto(u, u, select='name CA')

            positions = np.zeros((len(u.trajectory), len(ca_atoms), 3))

            for i, ts in enumerate(u.trajectory):
                positions[i] = ca_atoms.positions

            mean_positions = positions.mean(axis=0)
            fluctuations = positions - mean_positions
            covariance_matrix = np.tensordot(fluctuations, fluctuations, axes=((0, 2), (0, 2)))
            dccm = np.corrcoef(covariance_matrix)
            
            # Generate plot with customizations
            fig, ax = plt.subplots(figsize=(10, 10))
            im = ax.imshow(dccm, cmap=cmap, vmin=vmin, vmax=vmax)
            ax.set_title(title, fontsize=16)
            ax.set_xlabel(xlabel, fontsize=15)
            ax.set_ylabel(ylabel, fontsize=15)
            ax.tick_params(axis='both', which='major', labelsize=12)
            ax.invert_yaxis()

            # Add color bar with label
            plt.colorbar(im, ax=ax, label=colorbar_label)
            
            # Convert plot to base64 image
            buf = io.BytesIO()
            fig.savefig(buf, format="png", dpi=dpi, bbox_inches='tight')
            buf.seek(0)
            
            # Encode and return
            img_str = base64.b64encode(buf.read()).decode('utf-8')
            plt.close(fig)  # Close the figure to free memory
            
            # Also return the matrix data for frontend visualization
            return {
                "plot": f"data:image/png;base64,{img_str}",
                "matrix": dccm.tolist(),
                "residue_count": len(ca_atoms)
            }
            
        finally:
            # Clean up temporary files
            os.unlink(pdb_temp_path)
            os.unlink(xtc_temp_path)
    
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/contact_map")
async def generate_contact_map(
    pdb_file: UploadFile = File(...),
    cutoff: float = Form(8.0),
    cmap: str = Form("viridis"),
    vmin: float = Form(0.0),
    vmax: float = Form(1.0),
    xlabel: str = Form("Residue Index"),
    ylabel: str = Form("Residue Index"),
    xticks_gap: int = Form(10),
    yticks_gap: int = Form(10),
    xlim_min: int = Form(None),
    xlim_max: int = Form(None),
    ylim_min: int = Form(None),
    ylim_max: int = Form(None),
    label_fontsize: int = Form(15),
    tick_labelsize: int = Form(12),
    dpi: int = Form(300)
):
    try:
        # Check if MDAnalysis is installed
        if not MDAnalysis_INSTALLED:
            return {"error": "MDAnalysis not installed on the server"}
        
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdb") as pdb_temp:
            pdb_temp_path = pdb_temp.name
            contents = await pdb_file.read()
            pdb_temp.write(contents)
        
        try:
            # Calculate contact map
            u = mda.Universe(pdb_temp_path)
            protein = u.select_atoms('protein')
            ca_atoms = protein.select_atoms('name CA')
            num_residues = len(ca_atoms)
            
            # Initialize contact map matrix
            contact_map = np.zeros((num_residues, num_residues))
            
            # Calculate distances and populate contact map
            for i, j in combinations(range(num_residues), 2):
                distance = np.linalg.norm(ca_atoms.positions[i] - ca_atoms.positions[j])
                if distance < cutoff:
                    contact_map[i, j] = 1
                    contact_map[j, i] = 1
            
            # Plot contact map
            fig, ax = plt.subplots(figsize=(10, 10))
            
            # Set range values
            x_min = 0 if xlim_min is None else xlim_min
            x_max = num_residues if xlim_max is None else min(xlim_max, num_residues)
            y_min = 0 if ylim_min is None else ylim_min
            y_max = num_residues if ylim_max is None else min(ylim_max, num_residues)
            
            # Create plot
            im = ax.imshow(contact_map, cmap=cmap, vmin=vmin, vmax=vmax)
            ax.set_xlabel(xlabel, fontsize=label_fontsize)
            ax.set_ylabel(ylabel, fontsize=label_fontsize)
            
            # Set ticks
            xticks = np.arange(x_min, x_max + 1, xticks_gap)
            yticks = np.arange(y_min, y_max + 1, yticks_gap)
            
            # Only set ticks if they're within the actual range
            if len(xticks) > 0:
                ax.set_xticks(xticks)
            
            if len(yticks) > 0:
                ax.set_yticks(yticks)
                
            ax.tick_params(axis='both', which='major', labelsize=tick_labelsize)
            ax.invert_yaxis()
            
            # Add colorbar
            plt.colorbar(im, ax=ax, label='Contact')
            
            # Convert plot to base64 image
            buf = io.BytesIO()
            fig.savefig(buf, format="png", dpi=dpi, bbox_inches='tight')
            buf.seek(0)
            
            # Encode and return
            img_str = base64.b64encode(buf.read()).decode('utf-8')
            plt.close(fig)  # Close the figure to free memory
            
            # Return both image and matrix data
            return {
                "plot": f"data:image/png;base64,{img_str}",
                "matrix": contact_map.tolist(),
                "residue_count": num_residues
            }
            
        finally:
            # Clean up temporary file
            os.unlink(pdb_temp_path)
    
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/api/pca")
async def perform_dimensionality_reduction(
    xtc_file: UploadFile = File(...),
    pdb_file: UploadFile = File(...),
    method: str = Form("pca"),
    selection: str = Form("backbone"),
    stride: int = Form(1),
    n_components: int = Form(10),
    comp1: int = Form(0),
    comp2: int = Form(1),
    dpi: int = Form(300)
):
    try:
        print("Starting PCA analysis...")  # Debug log
        if not MDAnalysis_INSTALLED or not SKLEARN_INSTALLED:
            return {
                "error": "Required libraries not installed. Please install MDAnalysis and scikit-learn."
            }
        
        # Save uploaded files temporarily
        with tempfile.NamedTemporaryFile(suffix=".xtc", delete=False) as temp_xtc:
            temp_xtc.write(await xtc_file.read())
            xtc_path = temp_xtc.name
            print(f"Saved XTC file to: {xtc_path}")  # Debug log
        
        with tempfile.NamedTemporaryFile(suffix=".pdb", delete=False) as temp_pdb:
            temp_pdb.write(await pdb_file.read())
            pdb_path = temp_pdb.name
            print(f"Saved PDB file to: {pdb_path}")  # Debug log
            
        try:
            import MDAnalysis as mda
            import matplotlib
            matplotlib.use('Agg')  # Non-interactive backend
            print("Imported required libraries")  # Debug log
            
            # Load trajectory
            print("Loading trajectory...")  # Debug log
            u = mda.Universe(pdb_path, xtc_path)
            
            # Select atoms for analysis
            try:
                print(f"Selecting atoms with: {selection}")  # Debug log
                selected_atoms = u.select_atoms(selection)
                if len(selected_atoms) == 0:
                    return {"error": f"Selection '{selection}' did not match any atoms."}
                print(f"Selected {len(selected_atoms)} atoms")  # Debug log
            except Exception as e:
                return {"error": f"Selection error: {str(e)}"}
            
            # Extract coordinates
            print("Extracting coordinates...")  # Debug log
            n_frames = len(u.trajectory[::stride])
            coords = np.zeros((n_frames, len(selected_atoms), 3))
            
            for i, ts in enumerate(u.trajectory[::stride]):
                coords[i] = selected_atoms.positions
            print(f"Extracted coordinates for {n_frames} frames")  # Debug log
                
            # Reshape to 2D array (n_frames, n_atoms * 3)
            n_atoms = len(selected_atoms)
            features = coords.reshape(n_frames, n_atoms * 3)
            
            # Center the data
            features_centered = features - np.mean(features, axis=0)
            
            # Generate PCA results (for variance plot and preprocessing)
            print("Performing PCA...")  # Debug log
            pca = PCA(n_components=min(n_components, features_centered.shape[0], features_centered.shape[1]))
            pca_result = pca.fit_transform(features_centered)
            explained_variance = pca.explained_variance_ratio_
            cumulative_variance = np.cumsum(explained_variance)
            n_components_70 = np.argmax(cumulative_variance >= 0.7) + 1 if any(cumulative_variance >= 0.7) else len(cumulative_variance)
            print(f"PCA completed. Explained variance shape: {explained_variance.shape}")  # Debug log

            # Generate variance plot
            print("Generating variance plot...")  # Debug log
            plt.rcParams.update({
                'font.size': 12,
                'axes.labelsize': 14,
                'axes.titlesize': 16,
                'xtick.labelsize': 12,
                'ytick.labelsize': 12,
                'legend.fontsize': 12,
                'figure.dpi': 300,
                'savefig.dpi': 300,
                'figure.figsize': (12, 8)
            })
            
            fig_variance, ax1 = plt.subplots(figsize=(12, 8))
            
            # Plot individual explained variance
            max_comp_to_plot = min(20, len(explained_variance))
            ax1.bar(
                range(1, max_comp_to_plot + 1),
                explained_variance[:max_comp_to_plot] * 100,
                alpha=0.7,
                color='#1f77b4',
                label='Individual explained variance'
            )
            ax1.set_xlabel('Principal Component', fontsize=14, fontweight='bold')
            ax1.set_ylabel('Explained Variance (%)', color='#1f77b4', fontsize=14, fontweight='bold')
            ax1.tick_params(axis='y', labelcolor='#1f77b4', labelsize=12)
            ax1.tick_params(axis='x', labelsize=12)
            
            # Plot cumulative explained variance
            ax2 = ax1.twinx()
            ax2.plot(
                range(1, max_comp_to_plot + 1),
                cumulative_variance[:max_comp_to_plot] * 100,
                'r-',
                marker='o',
                markersize=6,
                linewidth=2,
                label='Cumulative explained variance'
            )
            ax2.set_ylabel('Cumulative Explained Variance (%)', color='red', fontsize=14, fontweight='bold')
            ax2.tick_params(axis='y', labelcolor='red', labelsize=12)
            
            # Add horizontal line at 70%
            ax2.axhline(y=70, color='green', linestyle='--', alpha=0.7, linewidth=2)
            ax2.text(max_comp_to_plot / 2, 71, '70% threshold', color='green', fontsize=12, fontweight='bold')
            
            # Highlight number of components explaining 70% variance
            if n_components_70 <= max_comp_to_plot:
                ax2.plot(n_components_70, cumulative_variance[n_components_70-1] * 100,
                       'go', markersize=10)
                ax2.text(
                    n_components_70,
                    cumulative_variance[n_components_70-1] * 100 + 2,
                    f'PC{n_components_70}: {cumulative_variance[n_components_70-1]*100:.1f}%',
                    color='green',
                    fontsize=12,
                    fontweight='bold'
                )
            
            plt.title('PCA Explained Variance', fontsize=16, fontweight='bold', pad=20)
            fig_variance.tight_layout()
            
            # Create separate legend
            lines_1, labels_1 = ax1.get_legend_handles_labels()
            lines_2, labels_2 = ax2.get_legend_handles_labels()
            ax2.legend(lines_1 + lines_2, labels_1 + labels_2, loc='upper left', fontsize=12)
            
            # Add grid
            ax1.grid(alpha=0.3)
            ax2.grid(alpha=0.3)
            
            # Save variance plot to buffer
            print("Saving variance plot...")  # Debug log
            var_buf = io.BytesIO()
            fig_variance.savefig(var_buf, format='png', dpi=300, bbox_inches='tight')
            var_buf.seek(0)
            variance_plot_data = base64.b64encode(var_buf.read()).decode('utf-8')
            plt.close(fig_variance)
            print("Variance plot saved")  # Debug log
            
            # Perform the requested dimensionality reduction
            result = None
            print(f"Performing {method} analysis...")  # Debug log
            
            if method == 'pca':
                result = pca_result
                # Limit components to what we have
                comp1 = min(comp1, result.shape[1]-1)
                comp2 = min(comp2, result.shape[1]-1)
                
            elif method == 'tsne':
                if not SKLEARN_INSTALLED:
                    return {"error": "scikit-learn not installed for t-SNE"}
                
                # Use PCA for preprocessing (50 components or all if fewer)
                n_preproc = min(50, pca_result.shape[1])
                tsne = TSNE(n_components=min(3, n_preproc), perplexity=min(30, n_frames-1), random_state=42)
                result = tsne.fit_transform(pca_result[:, :n_preproc])
                # Limit components to what we have
                comp1 = min(comp1, result.shape[1]-1)
                comp2 = min(comp2, result.shape[1]-1)
                
            elif method == 'umap':
                if not UMAP_INSTALLED:
                    return {"error": "UMAP not installed"}
                
                # Use PCA for preprocessing (50 components or all if fewer)
                n_preproc = min(50, pca_result.shape[1])
                umap_model = UMAP(n_components=min(3, n_preproc), n_neighbors=min(15, n_frames-1), 
                                 min_dist=0.1, random_state=42)
                result = umap_model.fit_transform(pca_result[:, :n_preproc])
                # Limit components to what we have
                comp1 = min(comp1, result.shape[1]-1)
                comp2 = min(comp2, result.shape[1]-1)
            
            else:
                return {"error": f"Unknown method: {method}"}
            
            print(f"Dimensionality reduction completed. Result shape: {result.shape}")  # Debug log
                
            # Make sure comp1 and comp2 are different
            if comp1 == comp2:
                comp2 = (comp2 + 1) % result.shape[1]
            
            # Generate projection plot
            print("Generating projection plot...")  # Debug log
            fig_proj, ax = plt.subplots(figsize=(12, 10))
            
            # Get time from trajectory if available
            time_data = np.array([ts.time for ts in u.trajectory[::stride]])
            if time_data[0] is None or np.isnan(time_data[0]):
                time_data = np.arange(n_frames)
            
            # Create scatter plot with time as color
            scatter = ax.scatter(
                result[:, comp1], 
                result[:, comp2],
                c=time_data,
                cmap='viridis',
                s=50,  # Increased marker size
                alpha=0.8,
                edgecolors='none'
            )
            
            # Add colorbar
            cbar = plt.colorbar(scatter)
            cbar.set_label('Simulation Time', fontsize=14, fontweight='bold')
            cbar.ax.tick_params(labelsize=12)
            
            # Set labels
            method_names = {'pca': 'PC', 'tsne': 't-SNE', 'umap': 'UMAP'}
            comp1_idx = comp1 + 1  # Convert to 1-indexed for display
            comp2_idx = comp2 + 1  # Convert to 1-indexed for display
            
            if method == 'pca':
                var1 = explained_variance[comp1] * 100
                var2 = explained_variance[comp2] * 100
                ax.set_xlabel(f'{method_names[method]}{comp1_idx} ({var1:.1f}%)', fontsize=14, fontweight='bold')
                ax.set_ylabel(f'{method_names[method]}{comp2_idx} ({var2:.1f}%)', fontsize=14, fontweight='bold')
            else:
                ax.set_xlabel(f'{method_names[method]}{comp1_idx}', fontsize=14, fontweight='bold')
                ax.set_ylabel(f'{method_names[method]}{comp2_idx}', fontsize=14, fontweight='bold')
            
            # Set title
            title = f'{method.upper()} Projection: Component {comp1_idx} vs Component {comp2_idx}'
            plt.title(title, fontsize=16, fontweight='bold', pad=20)
            
            # Add grid
            ax.grid(alpha=0.3)
            ax.tick_params(labelsize=12)
            
            plt.tight_layout()
            
            # Save projection plot to buffer
            print("Saving projection plot...")
            proj_buf = io.BytesIO()
            fig_proj.savefig(proj_buf, format='png', dpi=300, bbox_inches='tight')
            proj_buf.seek(0)
            projection_plot_data = base64.b64encode(proj_buf.read()).decode('utf-8')
            plt.close(fig_proj)
            print("Projection plot saved")  # Debug log
            
            # Prepare component options based on results
            component_options = []
            max_comp = result.shape[1]
            for i in range(max_comp):
                if method == 'pca' and i < len(explained_variance):
                    component_options.append({
                        "value": i,
                        "label": f"Component {i+1} ({explained_variance[i]*100:.1f}%)"
                    })
                else:
                    component_options.append({
                        "value": i,
                        "label": f"Component {i+1}"
                    })
            
            print("Preparing response...")  # Debug log
            response_data = {
                "variance_plot": f"data:image/png;base64,{variance_plot_data}",
                "projection_plot": f"data:image/png;base64,{projection_plot_data}",
                "method": method,
                "n_frames": n_frames,
                "n_atoms": n_atoms,
                "comp1": comp1,
                "comp2": comp2,
                "n_components_70": int(n_components_70),
                "component_options": component_options,
                "explained_variance": explained_variance.tolist() if method == 'pca' else None,
                "cumulative_variance": cumulative_variance.tolist() if method == 'pca' else None
            }
            print("Response prepared")  # Debug log
            return response_data
            
        finally:
            # Clean up temporary files
            if os.path.exists(xtc_path):
                os.unlink(xtc_path)
            if os.path.exists(pdb_path):
                os.unlink(pdb_path)
                
    except Exception as e:
        import traceback
        traceback.print_exc()  # Print full traceback for debugging
        print(f"Error in PCA analysis: {str(e)}")  # Debug log
        return {"error": str(e)}

@app.post("/api/boiled_egg")
async def generate_boiled_egg(
    smiles: str = Form(...),
    title: str = Form("BOILED-Egg Plot"),
    x_label: str = Form("WLogP"),
    y_label: str = Form("TPSA"),
    point_size: int = Form(100),
    show_thresholds: bool = Form(True),
    wlogp_min: float = Form(-4.0),
    wlogp_max: float = Form(8.0),
    wlogp_threshold: float = Form(5.0),
    tpsa_min: float = Form(0.0),
    tpsa_max: float = Form(200.0),
    tpsa_threshold: float = Form(140.0),
    label_fontsize: int = Form(9),
    axis_fontsize: int = Form(12),
    title_fontsize: int = Form(14),
    dpi: int = Form(300)
):
    try:
        if not RDKIT_INSTALLED:
            return {"error": "RDKit not installed on the server"}
        
        from rdkit import Chem
        from rdkit.Chem import Descriptors
        from rdkit.Chem import Draw
        from rdkit.Chem import AllChem
        import matplotlib.pyplot as plt
        import numpy as np
        from matplotlib.patches import Ellipse
        
        # Parse SMILES strings
        smiles_list = [line.split('#')[0].strip() for line in smiles.split('\n') if line.strip()]
        valid_molecules = []
        invalid_smiles = []
        
        for i, smi in enumerate(smiles_list):
            try:
                mol = Chem.MolFromSmiles(smi)
                if mol is not None:
                    # Calculate descriptors
                    tpsa = Descriptors.TPSA(mol)
                    wlogp = Descriptors.MolLogP(mol)
                    
                    # Determine region based on elliptical boundaries
                    # Parameters for the egg white (GI absorption) ellipse
                    white_center = (2.3, 70)
                    white_width = 7.6
                    white_height = 140
                    
                    # Parameters for the egg yolk (brain penetration) ellipse
                    yolk_center = (2.8, 90)
                    yolk_width = 6.0
                    yolk_height = 120
                    
                    # Check if point is in egg white (GI absorption)
                    in_white = ((wlogp - white_center[0])**2 / (white_width/2)**2 + 
                              (tpsa - white_center[1])**2 / (white_height/2)**2) <= 1
                    
                    # Check if point is in egg yolk (brain penetration)
                    in_yolk = ((wlogp - yolk_center[0])**2 / (yolk_width/2)**2 + 
                              (tpsa - yolk_center[1])**2 / (yolk_height/2)**2) <= 1
                    
                    if in_white and not in_yolk:
                        region = "egg_white"
                        absorption = "High probability of passive absorption by the gastrointestinal tract"
                    elif in_yolk:
                        region = "egg_yolk"
                        absorption = "High probability of brain penetration"
                    else:
                        region = "outside"
                        absorption = "Low probability of both GI absorption and brain penetration"
                    
                    # Get molecule name from comment if available
                    name = ""
                    if '#' in smiles.split('\n')[i]:
                        name = smiles.split('\n')[i].split('#')[1].strip()
                    
                    valid_molecules.append({
                        "id": i + 1,
                        "smiles": smi,
                        "tpsa": tpsa,
                        "wlogp": wlogp,
                        "region": region,
                        "absorption": absorption,
                        "name": name
                    })
                else:
                    invalid_smiles.append([i + 1, smi])
            except Exception:
                invalid_smiles.append([i + 1, smi])
        
        if not valid_molecules:
            return {"error": "No valid SMILES strings provided"}
        
        # Create plot
        fig, ax = plt.subplots(figsize=(12, 10))
        
        # Set background color to light grey
        ax.set_facecolor('#f0f0f0')
        
        # Create egg white ellipse (yellow region)
        white_ellipse = Ellipse(white_center, white_width, white_height, 
                              facecolor='yellow', alpha=0.3, edgecolor='none')
        ax.add_patch(white_ellipse)
        
        # Create egg yolk ellipse (white region)
        yolk_ellipse = Ellipse(yolk_center, yolk_width, yolk_height,
                              facecolor='white', alpha=0.5, edgecolor='black', linewidth=1)
        ax.add_patch(yolk_ellipse)
        
        # Plot points
        for mol in valid_molecules:
            if mol["region"] == "egg_white":
                color = 'yellow'
                edgecolor = 'black'
            elif mol["region"] == "egg_yolk":
                color = 'white'
                edgecolor = 'black'
            else:
                color = 'grey'
                edgecolor = 'black'
            
            point = ax.scatter(
                mol["wlogp"], 
                mol["tpsa"], 
                s=point_size,
                c=color,
                edgecolor=edgecolor,
                alpha=0.7,
                linewidth=1
            )
            
            # Add label with molecule name or ID
            label = mol["name"] if mol["name"] else f"Molecule {mol['id']}"
            ax.annotate(
                label,
                (mol["wlogp"], mol["tpsa"]),
                xytext=(10, 10),
                textcoords='offset points',
                fontsize=label_fontsize,
                bbox=dict(boxstyle='round,pad=0.5', fc='white', alpha=0.7)
            )
        
        # Set labels and title
        ax.set_xlabel(x_label, fontsize=axis_fontsize)
        ax.set_ylabel(y_label, fontsize=axis_fontsize)
        ax.set_title(title, fontsize=title_fontsize)
        
        # Set tick label sizes
        ax.tick_params(axis='both', which='major', labelsize=label_fontsize)
        
        # Add grid
        ax.grid(True, alpha=0.3)
        
        # Set axis limits with user-defined min/max values
        ax.set_xlim([wlogp_min, wlogp_max])
        ax.set_ylim([tpsa_min, tpsa_max])
        
        # Add legend
        white_patch = plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='yellow', markeredgecolor='black', markersize=10, label='Egg White (High GI absorption)')
        yolk_patch = plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='white', markeredgecolor='black', markersize=10, label='Egg Yolk (Brain penetration)')
        grey_patch = plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='grey', markeredgecolor='black', markersize=10, label='Outside (Low probability)')
        ax.legend(handles=[white_patch, yolk_patch, grey_patch], loc='upper right')
        
        # Convert plot to base64 image
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=dpi, bbox_inches='tight')
        buf.seek(0)
        
        # Encode and return
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)  # Close the figure to free memory
        
        return {
            "plot": f"data:image/png;base64,{img_str}",
            "molecules": valid_molecules,
            "invalid_smiles": invalid_smiles,
            "valid_count": len(valid_molecules),
            "invalid_count": len(invalid_smiles)
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/lipinski")
async def calculate_lipinski(
    smiles: str = Form(...),
    include_radar: bool = Form(True),
    include_distributions: bool = Form(True)
):
    try:
        if not RDKIT_INSTALLED:
            return {"error": "RDKit not installed on the server"}
        
        from rdkit import Chem
        from rdkit.Chem import Descriptors, Draw
        from rdkit.Chem import rdMolDescriptors
        import pandas as pd
        import matplotlib.pyplot as plt
        import seaborn as sns
        import numpy as np
        import base64
        import io
        import zipfile
        from io import BytesIO
        
        def calculate_properties(smiles):
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                return None
            
            properties = {
                "MW": Descriptors.ExactMolWt(mol),
                "nBonds": mol.GetNumBonds(),
                "fChar": Chem.GetFormalCharge(mol),
                "nHet": rdMolDescriptors.CalcNumHeteroatoms(mol),
                "MaxRing": max([len(ring) for ring in mol.GetRingInfo().AtomRings()]) if mol.GetRingInfo().AtomRings() else 0,
                "nRing": rdMolDescriptors.CalcNumRings(mol),
                "nRot": Descriptors.NumRotatableBonds(mol),
                "TPSA": Descriptors.TPSA(mol),
                "nHD": Descriptors.NumHDonors(mol),
                "nHA": Descriptors.NumHAcceptors(mol),
                "LogP": Descriptors.MolLogP(mol),
                "LogD": Descriptors.MolLogP(mol),
                "LogS": Descriptors.MolLogP(mol) - 0.89,
                "SC": len(Chem.FindMolChiralCenters(mol))
            }
            
            violations = []
            if properties["MW"] > 500: violations.append("MolWt > 500")
            if properties["nHD"] > 5: violations.append("HDonors > 5")
            if properties["nHA"] > 10: violations.append("HAcceptors > 10")
            if properties["LogP"] > 5: violations.append("LogP > 5")
            
            properties["FollowsLipinski"] = "No" if violations else "Yes"
            properties["Violations"] = ", ".join(violations) if violations else "--"
            
            atom_dist = {}
            for atom in mol.GetAtoms():
                symbol = atom.GetSymbol()
                atom_dist[symbol] = atom_dist.get(symbol, 0) + 1
            properties["AtomDistribution"] = atom_dist
            
            # Generate 2D structure image
            img = Draw.MolToImage(mol, size=(500, 500))
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            properties["structure_image"] = base64.b64encode(img_byte_arr).decode('utf-8')
            
            return properties

        def plot_distributions(data):
            plt.rcParams.update({
                'font.size': 12,
                'axes.labelsize': 14,
                'axes.titlesize': 16,
                'xtick.labelsize': 12,
                'ytick.labelsize': 12,
                'figure.dpi': 300,
                'savefig.dpi': 300
            })
            
            fig, axs = plt.subplots(2, 3, figsize=(15, 10))
            sns.histplot(data['MW'], ax=axs[0, 0], kde=True).set(title='Molecular Weight')
            sns.histplot(data['nHD'], ax=axs[0, 1], kde=True).set(title='H Donors')
            sns.histplot(data['nHA'], ax=axs[0, 2], kde=True).set(title='H Acceptors')
            sns.histplot(data['LogP'], ax=axs[1, 0], kde=True).set(title='LogP')
            sns.histplot(data['nRing'], ax=axs[1, 1], kde=True).set(title='Ring Count')
            sns.histplot(data['TPSA'], ax=axs[1, 2], kde=True).set(title='Polar Surface Area')
            plt.tight_layout()
            
            buf = io.BytesIO()
            fig.savefig(buf, format='png', dpi=300, bbox_inches='tight')
            buf.seek(0)
            return base64.b64encode(buf.read()).decode('utf-8')

        def plot_radar_normalized(properties):
            plt.rcParams.update({
                'font.size': 12,
                'axes.labelsize': 14,
                'axes.titlesize': 16,
                'xtick.labelsize': 12,
                'ytick.labelsize': 12,
                'figure.dpi': 300,
                'savefig.dpi': 300
            })
            
            ranges = {
                "MW": (160, 500),
                "nBonds": (0, 50),
                "fChar": (-2, 2),
                "nHet": (0, 10),
                "MaxRing": (0, 7),
                "nRing": (0, 4),
                "nRot": (0, 10),
                "TPSA": (0, 140),
                "nHD": (0, 5),
                "nHA": (0, 10),
                "LogD": (-3, 5),
                "LogS": (-6, 1),
                "LogP": (-3, 5)
            }
            
            normalized_values = {}
            for prop, (min_val, max_val) in ranges.items():
                if prop in properties:
                    val = properties[prop]
                    normalized_values[prop] = max(0, min(1, (val - min_val) / (max_val - min_val)))
            
            labels = list(ranges.keys())
            num_vars = len(labels)
            
            angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
            values = [normalized_values[key] for key in labels]
            
            values += values[:1]
            angles += angles[:1]
            labels += labels[:1]
            
            fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(polar=True))
            
            ax.plot(angles, values, 'o-', linewidth=2, label='Compound Properties', color='orange')
            ax.fill(angles, values, alpha=0.25, color='orange')
            
            lower_limits = [0] * len(labels)
            upper_limits = [1] * len(labels)
            ax.plot(angles, lower_limits, 'o-', linewidth=1, label='Lower Limit', color='green', alpha=0.5)
            ax.fill(angles, lower_limits, alpha=0.1, color='green')
            ax.plot(angles, upper_limits, 'o-', linewidth=1, label='Upper Limit', color='blue', alpha=0.5)
            ax.fill(angles, upper_limits, alpha=0.1, color='blue')
            
            ax.set_xticks(angles[:-1])
            ax.set_xticklabels(labels[:-1])
            ax.set_ylim(0, 1)
            
            ax.legend(loc='upper right', bbox_to_anchor=(0.1, 0.1))
            plt.title("Molecular Properties Radar Plot", pad=20)
            
            buf = io.BytesIO()
            fig.savefig(buf, format='png', dpi=300, bbox_inches='tight')
            buf.seek(0)
            return base64.b64encode(buf.read()).decode('utf-8')

        # Process SMILES strings
        smiles_list = [line.split('#')[0].strip() for line in smiles.split('\n') if line.strip()]
        compounds = []
        invalid_smiles = []
        
        for i, smi in enumerate(smiles_list):
            try:
                properties = calculate_properties(smi)
                if properties is not None:
                    # Get molecule name from comment if available
                    name = ""
                    if '#' in smiles.split('\n')[i]:
                        name = smiles.split('\n')[i].split('#')[1].strip()
                    properties["name"] = name
                    compounds.append(properties)
                else:
                    invalid_smiles.append([i + 1, smi])
            except Exception:
                invalid_smiles.append([i + 1, smi])
        
        if not compounds:
            return {"error": "No valid SMILES strings provided"}
        
        # Create DataFrame for CSV export
        df = pd.DataFrame([{
            "Name": c.get("name", f"Compound {i+1}"),
            "MW": c["MW"],
            "LogP": c["LogP"],
            "TPSA": c["TPSA"],
            "nRing": c["nRing"],
            "nHD": c["nHD"],
            "nHA": c["nHA"],
            "FollowsLipinski": c["FollowsLipinski"],
            "Violations": c["Violations"]
        } for i, c in enumerate(compounds)])
        
        # Generate plots if requested
        plots = {}
        if include_distributions and len(compounds) > 1:
            plots["distributions"] = plot_distributions(df)
        
        if include_radar:
            plots["radar"] = plot_radar_normalized(compounds[0])  # First compound for radar
        
        # Create ZIP file with all data
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'a', zipfile.ZIP_DEFLATED, False) as zip_file:
            # Add CSV
            csv_data = df.to_csv(index=False)
            zip_file.writestr('lipinski_data.csv', csv_data)
            
            # Add plots
            if "distributions" in plots:
                zip_file.writestr('distributions.png', base64.b64decode(plots["distributions"]))
            if "radar" in plots:
                zip_file.writestr('radar_plot.png', base64.b64decode(plots["radar"]))
        
        zip_buffer.seek(0)
        zip_data = base64.b64encode(zip_buffer.getvalue()).decode('utf-8')
        
        return {
            "compounds": compounds,
            "invalid_smiles": invalid_smiles,
            "plots": plots,
            "zip_data": zip_data
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.post("/api/tanimoto")
async def calculate_tanimoto(
    smiles1: str = Form(None),
    smiles2: str = Form(None),
    file: UploadFile = File(None),
    color_scheme: str = Form("Blues")
):
    try:
        if not RDKIT_INSTALLED:
            return {"error": "RDKit not installed on the server"}
        
        from rdkit import Chem
        from rdkit.Chem import AllChem
        from rdkit.Chem import Draw
        from rdkit.Chem import rdMolDescriptors
        import numpy as np
        import matplotlib.pyplot as plt
        import seaborn as sns
        import base64
        import io
        from itertools import combinations
        
        def calculate_similarity(mol1, mol2):
            # Generate Morgan fingerprints
            fp1 = AllChem.GetMorganFingerprintAsBitVect(mol1, 2, nBits=2048)
            fp2 = AllChem.GetMorganFingerprintAsBitVect(mol2, 2, nBits=2048)
            
            # Calculate Tanimoto similarity
            similarity = AllChem.DataStructs.TanimotoSimilarity(fp1, fp2)
            
            # Find common substructure
            common_substructure = Chem.MolFromSmarts(Chem.MolToSmarts(mol1))
            if common_substructure is not None:
                match = mol2.HasSubstructMatch(common_substructure)
            else:
                match = False
            
            return similarity, match

        def generate_structure_image(mol):
            img = Draw.MolToImage(mol, size=(500, 500))
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            return base64.b64encode(img_byte_arr).decode('utf-8')

        # Process input
        if file:
            # Read file content
            content = await file.read()
            smiles_list = [line.strip() for line in content.decode().split('\n') if line.strip()]
            
            # Convert SMILES to molecules
            molecules = []
            for smi in smiles_list:
                mol = Chem.MolFromSmiles(smi)
                if mol is not None:
                    molecules.append(mol)
            
            if len(molecules) < 2:
                return {"error": "File must contain at least 2 valid SMILES strings"}
            
            # Calculate similarity matrix
            n_molecules = len(molecules)
            similarity_matrix = np.zeros((n_molecules, n_molecules))
            
            for i, j in combinations(range(n_molecules), 2):
                similarity, _ = calculate_similarity(molecules[i], molecules[j])
                similarity_matrix[i, j] = similarity
                similarity_matrix[j, i] = similarity
            
            # Generate heatmap
            plt.figure(figsize=(10, 8))
            sns.heatmap(similarity_matrix, cmap=color_scheme, vmin=0, vmax=1)
            plt.title("Tanimoto Similarity Heatmap")
            plt.xlabel("Molecule Index")
            plt.ylabel("Molecule Index")
            
            # Save heatmap to buffer
            buf = io.BytesIO()
            plt.savefig(buf, format='png', dpi=300, bbox_inches='tight')
            buf.seek(0)
            heatmap_image = base64.b64encode(buf.read()).decode('utf-8')
            plt.close()
            
            # Generate structure images and calculate individual similarities
            compounds = []
            for i, mol in enumerate(molecules):
                compounds.append({
                    "structure_image": generate_structure_image(mol),
                    "name": f"Compound {i+1}"
                })
            
            return {
                "similarity_matrix": similarity_matrix.tolist(),
                "heatmap_image": heatmap_image,
                "compounds": compounds
            }
            
        else:
            # Process individual SMILES
            if not smiles1 or not smiles2:
                return {"error": "Both SMILES strings are required"}
            
            mol1 = Chem.MolFromSmiles(smiles1)
            mol2 = Chem.MolFromSmiles(smiles2)
            
            if mol1 is None or mol2 is None:
                return {"error": "Invalid SMILES strings provided"}
            
            # Calculate similarity
            similarity, common_substructure = calculate_similarity(mol1, mol2)
            
            # Generate structure images
            structure1 = generate_structure_image(mol1)
            structure2 = generate_structure_image(mol2)
            
            return {
                "similarity": similarity,
                "common_substructure": common_substructure,
                "compounds": [
                    {
                        "structure_image": structure1,
                        "name": "First Molecule"
                    },
                    {
                        "structure_image": structure2,
                        "name": "Second Molecule"
                    }
                ]
            }
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.post("/api/bfactor")
async def analyze_bfactor(
    pdb_file: UploadFile = File(...),
    show_std_dev: str = Form("false"),
    curve_x_label: str = Form("Residue Number"),
    curve_y_label: str = Form("B-factor Mean"),
    curve_x_label_size: str = Form("12"),
    curve_y_label_size: str = Form("12"),
    curve_tick_size: str = Form("10"),
    curve_x_tick_gap: str = Form("10"),
    curve_y_tick_gap: str = Form("0.1"),
    curve_linewidth: str = Form("1.5"),
    curve_x_tick_rotation: str = Form("0"),
    curve_x_min: Optional[str] = Form(None),
    curve_x_max: Optional[str] = Form(None),
    curve_y_min: Optional[str] = Form(None),
    curve_y_max: Optional[str] = Form(None),
    dist_x_label: str = Form("B-factor"),
    dist_y_label: str = Form("Density"),
    dist_x_label_size: str = Form("12"),
    dist_y_label_size: str = Form("12"),
    dist_tick_size: str = Form("10"),
    dist_x_tick_gap: str = Form("0.1"),
    dist_y_tick_gap: str = Form("0.01"),
    dist_x_tick_rotation: str = Form("0"),
    dist_alpha: str = Form("0.5"),
    dist_x_min: Optional[str] = Form(None),
    dist_x_max: Optional[str] = Form(None),
    dist_y_min: Optional[str] = Form(None),
    dist_y_max: Optional[str] = Form(None),
    dpi: str = Form("300")
):
    try:
        if not MDAnalysis_INSTALLED:
            return {"error": "MDAnalysis not installed on the server"}
        
        # Convert string parameters to appropriate types
        show_std_dev = show_std_dev.lower() == "true"
        dpi_val = int(dpi)
        
        # Parse curve plot parameters
        c_x_label_size = float(curve_x_label_size)
        c_y_label_size = float(curve_y_label_size)
        c_tick_size = float(curve_tick_size)
        c_x_tick_gap = float(curve_x_tick_gap)
        c_y_tick_gap = float(curve_y_tick_gap)
        c_linewidth = float(curve_linewidth)
        c_x_tick_rotation = float(curve_x_tick_rotation)
        
        # Parse optional limits for curve plot
        c_x_min = float(curve_x_min) if curve_x_min else None
        c_x_max = float(curve_x_max) if curve_x_max else None
        c_y_min = float(curve_y_min) if curve_y_min else None
        c_y_max = float(curve_y_max) if curve_y_max else None
        
        # Parse distribution plot parameters
        d_x_label_size = float(dist_x_label_size)
        d_y_label_size = float(dist_y_label_size)
        d_tick_size = float(dist_tick_size)
        d_x_tick_gap = float(dist_x_tick_gap)
        d_y_tick_gap = float(dist_y_tick_gap)
        d_x_tick_rotation = float(dist_x_tick_rotation)
        d_alpha = float(dist_alpha)
        
        # Parse optional limits for distribution plot
        d_x_min = float(dist_x_min) if dist_x_min else None
        d_x_max = float(dist_x_max) if dist_x_max else None
        d_y_min = float(dist_y_min) if dist_y_min else None
        d_y_max = float(dist_y_max) if dist_y_max else None
        
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdb") as pdb_temp:
            pdb_temp_path = pdb_temp.name
            contents = await pdb_file.read()
            pdb_temp.write(contents)
        
        try:
            # Load PDB file
            u = mda.Universe(pdb_temp_path)
            
            # Select protein atoms
            selected_atoms = u.select_atoms("protein")
            if len(selected_atoms) == 0:
                return {"error": "No protein atoms found in the PDB file"}
            
            # Get residue numbers and B-factors
            residue_numbers = []
            b_factors = []
            b_factor_stds = []
            
            for residue in selected_atoms.residues:
                residue_numbers.append(int(residue.resnum))
                # Get B-factors for all atoms in the residue
                residue_bfactors = [float(atom.bfactor) for atom in residue.atoms]
                b_factors.append(float(np.mean(residue_bfactors)))
                b_factor_stds.append(float(np.std(residue_bfactors)) if len(residue_bfactors) > 1 else 0.0)
            
            # Create residue plot (curve plot)
            fig_curve, ax_curve = plt.subplots(figsize=(10, 6))
            
            # Plot B-factors
            ax_curve.plot(residue_numbers, b_factors, 
                         color='#1f77b4', 
                         linewidth=c_linewidth)
            
            # Add standard deviation if requested
            if show_std_dev:
                upper = [b + s for b, s in zip(b_factors, b_factor_stds)]
                lower = [b - s for b, s in zip(b_factors, b_factor_stds)]
                ax_curve.fill_between(residue_numbers, lower, upper, color='#1f77b4', alpha=0.2)
            
            # Set axis labels and title
            ax_curve.set_xlabel(curve_x_label, fontsize=c_x_label_size)
            ax_curve.set_ylabel(curve_y_label, fontsize=c_y_label_size)
            ax_curve.set_title("B-factor by Residue", fontsize=c_x_label_size + 2)
            
            # Set tick parameters
            ax_curve.tick_params(axis='both', labelsize=c_tick_size)
            plt.xticks(rotation=c_x_tick_rotation)
            
            # Set custom axis limits if provided
            if c_x_min is not None:
                ax_curve.set_xlim(left=c_x_min)
            if c_x_max is not None:
                ax_curve.set_xlim(right=c_x_max)
            if c_y_min is not None:
                ax_curve.set_ylim(bottom=c_y_min)
            if c_y_max is not None:
                ax_curve.set_ylim(top=c_y_max)
            
            # Apply grid
            ax_curve.grid(True, alpha=0.3)
            
            # Save curve plot to base64
            buf_curve = io.BytesIO()
            fig_curve.savefig(buf_curve, format="png", dpi=dpi_val, bbox_inches='tight')
            buf_curve.seek(0)
            img_str_curve = base64.b64encode(buf_curve.read()).decode('utf-8')
            plt.close(fig_curve)  # Close the figure to free memory
            
            # Create distribution plot
            fig_dist, ax_dist = plt.subplots(figsize=(10, 6))
            
            # Plot B-factor distribution
            ax_dist.hist(b_factors, bins=30, alpha=d_alpha, color='#1f77b4', density=True)
            
            # Set axis labels and title
            ax_dist.set_xlabel(dist_x_label, fontsize=d_x_label_size)
            ax_dist.set_ylabel(dist_y_label, fontsize=d_y_label_size)
            ax_dist.set_title("B-factor Distribution", fontsize=d_x_label_size + 2)
            
            # Set tick parameters
            ax_dist.tick_params(axis='both', labelsize=d_tick_size)
            plt.xticks(rotation=d_x_tick_rotation)
            
            # Set custom axis limits if provided
            if d_x_min is not None:
                ax_dist.set_xlim(left=d_x_min)
            if d_x_max is not None:
                ax_dist.set_xlim(right=d_x_max)
            if d_y_min is not None:
                ax_dist.set_ylim(bottom=d_y_min)
            if d_y_max is not None:
                ax_dist.set_ylim(top=d_y_max)
            
            # Apply grid
            ax_dist.grid(True, alpha=0.3)
            
            # Save distribution plot to base64
            buf_dist = io.BytesIO()
            fig_dist.savefig(buf_dist, format="png", dpi=dpi_val, bbox_inches='tight')
            buf_dist.seek(0)
            img_str_dist = base64.b64encode(buf_dist.read()).decode('utf-8')
            plt.close(fig_dist)  # Close the figure to free memory
            
            # Prepare the residue data
            residue_data = []
            for i in range(len(residue_numbers)):
                residue_data.append({
                    "residue": int(residue_numbers[i]),
                    "mean_bfactor": float(b_factors[i]),
                    "std_bfactor": float(b_factor_stds[i])
                })
            
            return {
                "curve_plot": f"data:image/png;base64,{img_str_curve}",
                "dist_plot": f"data:image/png;base64,{img_str_dist}",
                "residue_data": residue_data,
                "residue_count": len(residue_data)
            }
            
        finally:
            # Clean up temporary file
            os.unlink(pdb_temp_path)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
