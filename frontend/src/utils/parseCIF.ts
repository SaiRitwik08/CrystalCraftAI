// CIF file parser utility

export interface ParsedCIF {
  lattice: {
    a: number;
    b: number;
    c: number;
    alpha: number;
    beta: number;
    gamma: number;
  };
  atoms: Array<{
    label: string;
    element: string;
    x: number;
    y: number;
    z: number;
  }>;
  spaceGroup?: string;
}

export function parseCIF(content: string): ParsedCIF {
  if (!content) {
    throw new Error("CIF content is empty or undefined");
  }
  const lines = content.split('\n');

  let a = 5, b = 5, c = 5;
  let alpha = 90, beta = 90, gamma = 90;
  let spaceGroup = 'P 1';
  const atoms: ParsedCIF['atoms'] = [];

  let inAtomLoop = false;
  let atomLabels: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Parse lattice parameters
    if (line.startsWith('_cell_length_a')) {
      a = parseFloat(line.split(/\s+/)[1]) || 5;
    } else if (line.startsWith('_cell_length_b')) {
      b = parseFloat(line.split(/\s+/)[1]) || 5;
    } else if (line.startsWith('_cell_length_c')) {
      c = parseFloat(line.split(/\s+/)[1]) || 5;
    } else if (line.startsWith('_cell_angle_alpha')) {
      alpha = parseFloat(line.split(/\s+/)[1]) || 90;
    } else if (line.startsWith('_cell_angle_beta')) {
      beta = parseFloat(line.split(/\s+/)[1]) || 90;
    } else if (line.startsWith('_cell_angle_gamma')) {
      gamma = parseFloat(line.split(/\s+/)[1]) || 90;
    } else if (line.includes('_symmetry_space_group_name')) {
      const match = line.match(/'([^']+)'/);
      if (match) spaceGroup = match[1];
    }

    // Parse atom loop
    if (line === 'loop_') {
      inAtomLoop = true;
      atomLabels = [];
      continue;
    }

    if (inAtomLoop) {
      if (line.startsWith('_atom_site_')) {
        atomLabels.push(line);
      } else if (line && !line.startsWith('_') && !line.startsWith('loop_') && !line.startsWith('#')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 5 && atomLabels.length > 0) {
          const labelIdx = atomLabels.findIndex(l => l.includes('label'));
          const typeIdx = atomLabels.findIndex(l => l.includes('type_symbol'));
          const xIdx = atomLabels.findIndex(l => l.includes('fract_x'));
          const yIdx = atomLabels.findIndex(l => l.includes('fract_y'));
          const zIdx = atomLabels.findIndex(l => l.includes('fract_z'));

          if (xIdx !== -1 && yIdx !== -1 && zIdx !== -1) {
            atoms.push({
              label: parts[labelIdx] || parts[0],
              element: parts[typeIdx] || parts[0].replace(/\d/g, ''),
              x: parseFloat(parts[xIdx]) || 0,
              y: parseFloat(parts[yIdx]) || 0,
              z: parseFloat(parts[zIdx]) || 0,
            });
          }
        }
      } else if (line.startsWith('loop_') || (line === '' && atoms.length > 0)) {
        inAtomLoop = false;
      }
    }
  }

  // Default atoms if none parsed
  if (atoms.length === 0) {
    atoms.push(
      { label: 'A1', element: 'Fe', x: 0, y: 0, z: 0 },
      { label: 'A2', element: 'Fe', x: 0.5, y: 0.5, z: 0.5 },
      { label: 'B1', element: 'O', x: 0.25, y: 0.25, z: 0.25 }
    );
  }

  return {
    lattice: { a, b, c, alpha, beta, gamma },
    atoms,
    spaceGroup,
  };
}

export function generateCIFContent(data: ParsedCIF): string {
  let cif = `data_crystal
_symmetry_space_group_name_H-M   '${data.spaceGroup || 'P 1'}'
_cell_length_a   ${data.lattice.a.toFixed(4)}
_cell_length_b   ${data.lattice.b.toFixed(4)}
_cell_length_c   ${data.lattice.c.toFixed(4)}
_cell_angle_alpha   ${data.lattice.alpha.toFixed(3)}
_cell_angle_beta    ${data.lattice.beta.toFixed(3)}
_cell_angle_gamma   ${data.lattice.gamma.toFixed(3)}

loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
`;

  for (const atom of data.atoms) {
    cif += `${atom.label} ${atom.element} ${atom.x.toFixed(4)} ${atom.y.toFixed(4)} ${atom.z.toFixed(4)}\n`;
  }

  return cif;
}
