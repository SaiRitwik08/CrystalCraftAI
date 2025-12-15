// API utility functions for Crystal-LLM backend

export interface GenerateResponse {
  cif_filename: string;
  cif_text: string;
  metadata: {
    lattice: {
      a: number;
      b: number;
      c: number;
      alpha: number;
      beta: number;
      gamma: number;
    };
    space_group: string;
    atomic_positions: Array<{
      element: string;
      x: number;
      y: number;
      z: number;
    }>;
    bond_info?: Array<{
      atom1: string;
      atom2: string;
      length: number;
    }>;
  };
}

const API_BASE = "/api"; // The vite proxy or full URL will handle this

export const generateCrystal = async (formula: string): Promise<GenerateResponse> => {
  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formula }),
    });

    if (!response.ok) {
        if (response.status === 500 || response.status === 503) {
             const errorData = await response.json().catch(() => ({}));
             if (errorData.error === "Model server offline") {
                 throw new Error("Model server offline");
             }
        }
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to generate crystal:", error);
    throw error;
  }
};
