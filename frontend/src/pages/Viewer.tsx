import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileUp, Download, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Viewer3D from "@/components/Viewer3D";
import StructureDetails from "@/components/StructureDetails";
import SymmetryPanel from "@/components/SymmetryPanel";
import DefectPanel from "@/components/DefectPanel";
import BondAnglePanel from "@/components/BondAnglePanel";
import { parseCIF, ParsedCIF } from "@/utils/parseCIF";

interface AtomData {
  element: string;
  x: number;
  y: number;
  z: number;
  isDefect?: boolean;
  defectType?: "vacancy" | "substitution";
}

const Viewer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCIF | null>(null);
  const [atoms, setAtoms] = useState<AtomData[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Symmetry state
  const [symmetry, setSymmetry] = useState({
    mirrorPlanes: false,
    rotationAxes: false,
    inversionCenter: false,
  });

  // Defect state
  const [selectedAtomIndex, setSelectedAtomIndex] = useState<number | null>(null);

  // Bond angle state
  const [bondAngles, setBondAngles] = useState<Array<{ atoms: [number, number, number]; angle: number }>>([]);

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.endsWith(".cif")) {
      toast.error("Please upload a CIF file");
      return;
    }

    setFile(f);
    setLoading(true);

    try {
      const content = await f.text();
      const parsed = parseCIF(content);
      setParsedData(parsed);
      setAtoms(
        parsed.atoms.map((atom) => ({
          element: atom.element,
          x: atom.x,
          y: atom.y,
          z: atom.z,
        }))
      );
      toast.success("CIF file loaded successfully!");
    } catch (error) {
      toast.error("Failed to parse CIF file");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSymmetryChange = (key: keyof typeof symmetry, value: boolean) => {
    setSymmetry((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyDefect = (atomIndex: number, defectType: "vacancy" | "substitution", newElement?: string) => {
    setAtoms((prev) =>
      prev.map((atom, i) =>
        i === atomIndex
          ? {
              ...atom,
              element: defectType === "substitution" && newElement ? newElement : atom.element,
              isDefect: true,
              defectType,
            }
          : atom
      )
    );
    toast.success(`${defectType === "vacancy" ? "Vacancy" : "Substitution"} defect applied`);
  };

  const handleClearDefects = () => {
    setAtoms((prev) =>
      prev.map((atom) => ({
        ...atom,
        isDefect: false,
        defectType: undefined,
      }))
    );
    toast.success("All defects cleared");
  };

  const handleAddAngle = (atomIndices: [number, number, number]) => {
    const a1 = atoms[atomIndices[0]];
    const a2 = atoms[atomIndices[1]];
    const a3 = atoms[atomIndices[2]];

    if (!a1 || !a2 || !a3) return;

    const v1 = { x: a1.x - a2.x, y: a1.y - a2.y, z: a1.z - a2.z };
    const v2 = { x: a3.x - a2.x, y: a3.y - a2.y, z: a3.z - a2.z };

    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2 + v1.z ** 2);
    const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2 + v2.z ** 2);

    const cosAngle = dot / (mag1 * mag2);
    const angle = (Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI;

    setBondAngles((prev) => [...prev, { atoms: atomIndices, angle }]);
    toast.success(`Bond angle measured: ${angle.toFixed(1)}°`);
  };

  const handleClear = () => {
    setFile(null);
    setParsedData(null);
    setAtoms([]);
    setBondAngles([]);
    setSymmetry({ mirrorPlanes: false, rotationAxes: false, inversionCenter: false });
  };

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">CIF Viewer</h1>
            <p className="text-sm text-muted-foreground">
              Upload and visualize your CIF structure files
            </p>
          </div>
          {file && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{file.name}</span>
              <Button variant="ghost" size="icon" onClick={handleClear}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </motion.div>

        {!parsedData ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative w-full max-w-xl p-12 rounded-2xl border-2 border-dashed transition-colors ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="mt-4 text-muted-foreground">Parsing CIF file...</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Drop your CIF file here
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse your files
                    </p>
                    <input
                      type="file"
                      accept=".cif"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button className="crystal-button text-primary-foreground">
                      <FileUp className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Sample CIF Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-muted-foreground">
                Supports standard CIF (Crystallographic Information File) format
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            {/* Main Viewer */}
            <div className="lg:col-span-3">
              <div className="h-[600px]">
                <Viewer3D
                  atoms={atoms}
                  lattice={parsedData.lattice}
                  showSymmetry={symmetry}
                  selectedAtoms={selectedAtomIndex !== null ? [selectedAtomIndex] : undefined}
                  bondAngles={bondAngles}
                />
              </div>
            </div>

            {/* Side Panels */}
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
              <StructureDetails
                lattice={{ ...parsedData.lattice, alpha: 90, beta: 90, gamma: 90 }}
                spaceGroup={parsedData.spaceGroup}
                atomicPositions={parsedData.atoms.map((a) => ({
                  element: a.element,
                  x: a.x,
                  y: a.y,
                  z: a.z,
                }))}
              />
            </div>

            {/* Bottom Panels */}
            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <SymmetryPanel
                symmetry={symmetry}
                onSymmetryChange={handleSymmetryChange}
              />
              <DefectPanel
                atoms={atoms}
                selectedAtomIndex={selectedAtomIndex}
                onSelectAtom={setSelectedAtomIndex}
                onApplyDefect={handleApplyDefect}
                onClearDefects={handleClearDefects}
              />
              <BondAnglePanel
                atoms={atoms}
                bondAngles={bondAngles}
                onAddAngle={handleAddAngle}
                onRemoveAngle={(i) => setBondAngles((prev) => prev.filter((_, idx) => idx !== i))}
                onClearAngles={() => setBondAngles([])}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Viewer;
