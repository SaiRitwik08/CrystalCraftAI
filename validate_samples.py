import os
from pymatgen.core import Structure

results = []
for i in range(1, 11):
    fname = f"sample_{i}.cif"
    try:
        s = Structure.from_file(fname)
        formula = s.composition.reduced_formula
        num_atoms = len(s)
        # Check if it's a valid NaCl-like structure
        is_correct = "Na" in formula and "Cl" in formula and len(set(s.species)) <= 3
        results.append({
            "file": fname,
            "valid": True,
            "formula": formula,
            "num_atoms": num_atoms,
            "correct_composition": is_correct
        })
        print(f"{fname}: VALID - {formula} ({num_atoms} atoms) - Correct: {is_correct}")
    except Exception as e:
        results.append({
            "file": fname,
            "valid": False,
            "error": str(e)[:100]
        })
        print(f"{fname}: INVALID - {str(e)[:80]}")

valid_count = sum(1 for r in results if r.get("valid", False))
correct_count = sum(1 for r in results if r.get("correct_composition", False))
print(f"\n=== SUMMARY ===")
print(f"Valid structures: {valid_count}/10")
print(f"Correct NaCl compositions: {correct_count}/10")
