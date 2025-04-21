
# SimAna Backend

This is the Python backend for SimAna, which provides molecular analysis tools via a REST API.

## Setup

1. Create a virtual environment (recommended):
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```
pip install -r requirements.txt
```

3. Run the server:
```
uvicorn main:app --reload
```

The API will be available at http://127.0.0.1:8000

## Available Endpoints

- `/api/ramachandran` - Generate Ramachandran plots
- `/api/lipinski` - Calculate Lipinski rule of five properties
- `/api/tanimoto` - Calculate Tanimoto similarity coefficient
- `/api/boiled_egg` - Generate BOILED-Egg plots for drug permeability

## Additional Packages

You may need to install additional packages depending on the analysis you want to perform:

```
pip install rdkit-pypi  # For chemical calculations
```
