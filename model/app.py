from flask import Flask, request, jsonify
import os
import random
from utils import parse_cif_metadata
from pymatgen.core import Structure

app = Flask(__name__)

CIF_DIR = os.path.join(os.path.dirname(__file__), 'static_cifs')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    formula = data.get('formula', '')
    
    if not formula:
        return jsonify({'error': 'Formula is required'}), 400

    # Search for matching CIF
    files = [f for f in os.listdir(CIF_DIR) if f.endswith('.cif')]
    matched_files = [f for f in files if formula.lower() in f.lower()]
    
    selected_file = None
    if matched_files:
        selected_file = matched_files[0]
    else:
        # Fallback to random if no match (per requirements "If none found -> pick random .cif")
        if files:
            selected_file = random.choice(files)
        else:
             return jsonify({'error': 'No CIF files available'}), 500
    
    file_path = os.path.join(CIF_DIR, selected_file)
    
    try:
        # 1. Read raw content for metadata (preserves original Space Group name)
        with open(file_path, 'r') as f:
            original_content = f.read()
            
        metadata = parse_cif_metadata(original_content)
        
        # 2. Use pymatgen to expand symmetry (get full unit cell atoms)
        struct = Structure.from_file(file_path)
        
        # 3. Construct explicit P1 CIF string
        # We manually build it to ensure format compatibility with the frontend parser
        lines = []
        lines.append(f"data_{formula}")
        lines.append("_symmetry_space_group_name_H-M   'P 1'")
        lines.append(f"_cell_length_a   {struct.lattice.a:.4f}")
        lines.append(f"_cell_length_b   {struct.lattice.b:.4f}")
        lines.append(f"_cell_length_c   {struct.lattice.c:.4f}")
        lines.append(f"_cell_angle_alpha   {struct.lattice.alpha:.3f}")
        lines.append(f"_cell_angle_beta    {struct.lattice.beta:.3f}")
        lines.append(f"_cell_angle_gamma   {struct.lattice.gamma:.3f}")
        lines.append("")
        lines.append("loop_")
        lines.append("_atom_site_label")
        lines.append("_atom_site_type_symbol")
        lines.append("_atom_site_fract_x")
        lines.append("_atom_site_fract_y")
        lines.append("_atom_site_fract_z")
        
        for i, site in enumerate(struct.sites):
            # clean label
            el = site.specie.symbol
            x, y, z = site.frac_coords
            lines.append(f"{el}{i+1} {el} {x:.5f} {y:.5f} {z:.5f}")
            
        expanded_cif = "\n".join(lines)
        
        return jsonify({
            "cif_filename": selected_file,
            "cif_text": expanded_cif,
            "metadata": metadata
        })
        
    except Exception as e:
        print(f"Error processing CIF: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
