import re

def parse_cif_metadata(cif_text):
    """
    Parses CIF text to extract metadata like lattice parameters, space group,
    and atomic positions. Uses regex to avoid heavy dependencies if pymatgen is an issue,
    but tries to be robust.
    """
    metadata = {
        "lattice": {
            "a": 0.0, "b": 0.0, "c": 0.0,
            "alpha": 90.0, "beta": 90.0, "gamma": 90.0
        },
        "space_group": "P 1",
        "atomic_positions": [],
        "bond_info": []
    }

    # Extract lattice parameters
    a_match = re.search(r'_cell_length_a\s+([\d\.]+)', cif_text)
    if a_match: metadata["lattice"]["a"] = float(a_match.group(1))

    b_match = re.search(r'_cell_length_b\s+([\d\.]+)', cif_text)
    if b_match: metadata["lattice"]["b"] = float(b_match.group(1))

    c_match = re.search(r'_cell_length_c\s+([\d\.]+)', cif_text)
    if c_match: metadata["lattice"]["c"] = float(c_match.group(1))

    alpha_match = re.search(r'_cell_angle_alpha\s+([\d\.]+)', cif_text)
    if alpha_match: metadata["lattice"]["alpha"] = float(alpha_match.group(1))

    beta_match = re.search(r'_cell_angle_beta\s+([\d\.]+)', cif_text)
    if beta_match: metadata["lattice"]["beta"] = float(beta_match.group(1))

    gamma_match = re.search(r'_cell_angle_gamma\s+([\d\.]+)', cif_text)
    if gamma_match: metadata["lattice"]["gamma"] = float(gamma_match.group(1))

    # Extract Space Group
    sg_match = re.search(r'_symmetry_space_group_name_H-M\s+[\'"]?([^\'"\n]+)[\'"]?', cif_text)
    if sg_match: metadata["space_group"] = sg_match.group(1).strip()

    # Extract Atomic Positions
    # Look for loop header
    loop_headers = []
    lines = cif_text.splitlines()
    in_loop = False
    header_indices = {}
    
    atom_data_start = False
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        if line.startswith('loop_'):
            in_loop = True
            loop_headers = []
            header_indices = {}
            atom_data_start = False
            continue
            
        if in_loop:
            if line.startswith('_'):
                loop_headers.append(line)
                if '_atom_site_label' in line: header_indices['label'] = len(loop_headers) - 1
                if '_atom_site_type_symbol' in line: header_indices['element'] = len(loop_headers) - 1
                if '_atom_site_fract_x' in line: header_indices['x'] = len(loop_headers) - 1
                if '_atom_site_fract_y' in line: header_indices['y'] = len(loop_headers) - 1
                if '_atom_site_fract_z' in line: header_indices['z'] = len(loop_headers) - 1
            else:
                # Data lines
                if len(header_indices) >= 4: # Need at least label/element and coords
                    parts = line.split()
                    if len(parts) >= len(loop_headers):
                        try:
                            # Basic extraction
                            element = parts[header_indices.get('element', header_indices.get('label', 0))]
                            # Clean element symbol (remove numbers)
                            element = re.sub(r'[^a-zA-Z]', '', element)
                            
                            x = float(parts[header_indices['x']])
                            y = float(parts[header_indices['y']])
                            z = float(parts[header_indices['z']])
                            
                            metadata["atomic_positions"].append({
                                "element": element,
                                "x": x, "y": y, "z": z
                            })
                        except (ValueError, IndexError):
                            pass
        
    return metadata
