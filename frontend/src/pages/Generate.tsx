import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, Loader2, Hexagon, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Viewer3D from "@/components/Viewer3D";
import StructureDetails from "@/components/StructureDetails";
import SymmetryPanel from "@/components/SymmetryPanel";
import DefectPanel from "@/components/DefectPanel";
import BondAnglePanel from "@/components/BondAnglePanel";
import { generateCrystal, GenerateResponse } from "@/utils/api";
import { parseCIF } from "@/utils/parseCIF";

interface AtomData {
  element: string;
  x: number;
  y: number;
  z: number;
  isDefect?: boolean;
  defectType?: "vacancy" | "substitution";
}

const Generate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formula = searchParams.get("formula") || "";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GenerateResponse | null>(null);
  const [atoms, setAtoms] = useState<AtomData[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!formula) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setServerError(null);
        const result = await generateCrystal(formula);
        setData(result);

        // Parse the returned CIF text to be the source of truth
        const parsed = parseCIF(result.cif_text);

        setAtoms(
          parsed.atoms.map((pos) => ({
            element: pos.element,
            x: pos.x,
            y: pos.y,
            z: pos.z,
          }))
        );
        toast.success("Crystal structure generated successfully!");
      } catch (error: any) {
        console.error("Generation Error:", error);
        if (error.message === "Model server offline") {
          setServerError("Model server offline");
        } else {
          toast.error(`Error: ${error.message || "Unknown error"}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formula, navigate]);

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

  const handleDownloadCIF = () => {
    if (!data?.cif_text) return;

    const blob = new Blob([data.cif_text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.cif_filename || `${formula.replace(/[^a-zA-Z0-9]/g, "")}_structure.cif`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CIF file downloaded");
  };

  if (serverError) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="text-center">
          <WifiOff className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Model Server Offline</h2>
          <p className="text-muted-foreground mb-6">The crystal generation service is currently unavailable.</p>
          <Button onClick={() => navigate("/")} variant="outline">Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {loading ? "Generating..." : formula}
              </h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "Creating crystal structure" : "Crystal Structure"}
              </p>
            </div>
          </div>
          {!loading && data && (
            <Button onClick={handleDownloadCIF} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download CIF
            </Button>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="relative">
                <Hexagon className="w-24 h-24 text-primary animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              </div>
              <p className="mt-6 text-lg text-muted-foreground animate-pulse">
                Generating crystal structure...
              </p>
              <p className="text-sm text-muted-foreground/60 mt-2">
                Analyzing chemical composition and searching structural database
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* Main Viewer */}
              <div className="lg:col-span-3">
                <div className="h-[600px]">
                  <Viewer3D
                    atoms={atoms}
                    lattice={data?.metadata.lattice}
                    showSymmetry={symmetry}
                    selectedAtoms={selectedAtomIndex !== null ? [selectedAtomIndex] : undefined}
                    bondAngles={bondAngles}
                  />
                </div>
              </div>

              {/* Side Panels */}
              <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                <StructureDetails
                  lattice={data?.metadata.lattice}
                  spaceGroup={data?.metadata.space_group}
                  atomicPositions={data?.metadata.atomic_positions}
                  bondInfo={data?.metadata.bond_info}
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
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Generate;
