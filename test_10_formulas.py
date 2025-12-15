import subprocess
import os
from pymatgen.core import Structure

# Define 10 different chemical formulas to test
formulas = [
    "NaCl",
    "SiO2", 
    "MgO",
    "TiO2",
    "Fe2O3",
    "ZnO",
    "CaO",
    "Al2O3",
    "CuO",
    "SnO2"
]

results = []
python_exe = r".\venv\Scripts\python.exe"

for formula in formulas:
    prompt = f"data_{formula}\n"
    outfile = f"test_{formula}.cif"
    
    # Generate sample
    cmd = [
        python_exe, "bin/sample.py",
        "out_dir=out_crystallm_v1_from_scratch",
        f"start={prompt}",
        "num_samples=1",
        "max_new_tokens=600",
        "dtype=float16",
        "device=cuda",
        "target=console"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        output = result.stdout
        
        # Extract CIF content (after the config output)
        if "number of parameters" in output:
            cif_start = output.find("data_")
            if cif_start != -1:
                cif_content = output[cif_start:output.rfind("---------------")].strip()
                
                # Save to file
                with open(outfile, "w") as f:
                    f.write(cif_content)
                
                # Validate with pymatgen
                try:
                    s = Structure.from_file(outfile)
                    gen_formula = s.composition.reduced_formula
                    
                    # Check if generated formula matches requested
                    # Simple check: all requested elements should be present
                    from pymatgen.core import Composition
                    requested = Composition(formula)
                    generated = s.composition
                    
                    req_elements = set(str(e) for e in requested.elements)
                    gen_elements = set(str(e) for e in generated.elements)
                    
                    correct = req_elements == gen_elements
                    
                    results.append({
                        "requested": formula,
                        "generated": gen_formula,
                        "valid": True,
                        "correct": correct,
                        "num_atoms": len(s)
                    })
                    status = "OK" if correct else "WRONG"
                    print(f"{formula}: {status} Generated {gen_formula} ({len(s)} atoms)")
                except Exception as e:
                    results.append({
                        "requested": formula,
                        "valid": False,
                        "correct": False,
                        "error": str(e)[:50]
                    })
                    print(f"{formula}: INVALID - {str(e)[:40]}")
            else:
                results.append({"requested": formula, "valid": False, "correct": False, "error": "No CIF output"})
                print(f"{formula}: NOCIF - No CIF in output")
        else:
            results.append({"requested": formula, "valid": False, "correct": False, "error": "Generation failed"})
            print(f"{formula}: FAIL - Generation failed")
    except Exception as e:
        results.append({"requested": formula, "valid": False, "correct": False, "error": str(e)[:50]})
        print(f"{formula}: ERROR - {str(e)[:40]}")

# Summary
print("\n" + "="*50)
print("SUMMARY")
print("="*50)
valid = sum(1 for r in results if r.get("valid", False))
correct = sum(1 for r in results if r.get("correct", False))
print(f"Valid structures: {valid}/10")
print(f"Correct compositions: {correct}/10")
print(f"Accuracy: {correct/10*100:.0f}%")
