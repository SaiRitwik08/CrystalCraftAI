
import os
import sys
import torch
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
import subprocess

# Add bin directory to path to import sample logic if needed
# But better to just use subprocess to call sample.py for stability 
# or import the model directly if we want speed.
# For simplicity and reliability in this demo, let's wrap the sample CLI.

app = FastAPI(title="CrystaLLM API")

class GenerationRequest(BaseModel):
    formula: str
    num_samples: int = 1
    temperature: float = 0.8

@app.get("/")
def health_check():
    return {"status": "ready", "model": "crystallm_v1_10k"}

@app.post("/generate")
def generate_crystal(request: GenerationRequest):
    """
    Generates a CIF file for the given formula.
    """
    print(f"Received request for: {request.formula}")
    
    # Clean formula to prevent injection
    safe_formula = "".join(c for c in request.formula if c.isalnum())
    prompt = f"data_{safe_formula}\n"
    
    # Arguments for sample.py
    # We use subprocess to isolate the generation memory/state
    cmd = [
        sys.executable, "bin/sample.py",
        "out_dir=out_crystallm_v1_from_scratch",
        f"start={prompt}",
        f"num_samples={request.num_samples}",
        "max_new_tokens=2000",
        f"temperature={request.temperature}",
        "device=cuda",
        "target=console" # Output to stdout so we can capture it
    ]
    
    try:
        # Run generation
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode != 0:
            print("Error in generation:", result.stderr)
            raise HTTPException(status_code=500, detail="Model generation failed")
            
        # Parse output to find CIF
        output = result.stdout
        cifs = []
        parts = output.split('---------------')
        for part in parts:
            if "data_" in part:
                start_idx = part.find("data_")
                cif_content = part[start_idx:].strip()
                cifs.append(cif_content)
        
        if not cifs:
            raise HTTPException(status_code=500, detail="No valid CIF generated")
            
        return {
            "formula": request.formula,
            "cif": cifs[0], # Return the first sample
            "all_samples": cifs
        }

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Generation timed out")
    except Exception as e:
        print(f"Exception: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting CrystaLLM Server on port 8000...")
    print("Test it with: POST http://localhost:8000/generate { 'formula': 'NaCl' }")
    uvicorn.run(app, host="0.0.0.0", port=8000)
