import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Triangle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AtomData {
  element: string;
  x: number;
  y: number;
  z: number;
}

interface BondAnglePanelProps {
  atoms: AtomData[];
  bondAngles: Array<{ atoms: [number, number, number]; angle: number }>;
  onAddAngle: (atoms: [number, number, number]) => void;
  onRemoveAngle: (index: number) => void;
  onClearAngles: () => void;
}

const BondAnglePanel = ({
  atoms,
  bondAngles,
  onAddAngle,
  onRemoveAngle,
  onClearAngles,
}: BondAnglePanelProps) => {
  const [selectedAtoms, setSelectedAtoms] = useState<number[]>([]);

  const handleAtomClick = (index: number) => {
    if (selectedAtoms.includes(index)) {
      setSelectedAtoms(selectedAtoms.filter((i) => i !== index));
    } else if (selectedAtoms.length < 3) {
      const newSelection = [...selectedAtoms, index];
      setSelectedAtoms(newSelection);

      if (newSelection.length === 3) {
        const angle = calculateAngle(
          atoms[newSelection[0]],
          atoms[newSelection[1]],
          atoms[newSelection[2]]
        );
        onAddAngle(newSelection as [number, number, number]);
        setSelectedAtoms([]);
      }
    }
  };

  const calculateAngle = (a1: AtomData, a2: AtomData, a3: AtomData): number => {
    const v1 = { x: a1.x - a2.x, y: a1.y - a2.y, z: a1.z - a2.z };
    const v2 = { x: a3.x - a2.x, y: a3.y - a2.y, z: a3.z - a2.z };

    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2 + v1.z ** 2);
    const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2 + v2.z ** 2);

    const cosAngle = dot / (mag1 * mag2);
    return (Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="panel"
    >
      <div className="panel-header">
        <Triangle className="w-4 h-4 text-primary" />
        <h3 className="panel-title">Bond-Angle Analyzer</h3>
      </div>

      <div className="space-y-4">
        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
          Select 3 atoms to measure the angle. The middle atom is the vertex.
        </div>

        {/* Selection Progress */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Selected:</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  selectedAtoms[i] !== undefined
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {selectedAtoms[i] !== undefined ? atoms[selectedAtoms[i]]?.element : i + 1}
              </div>
            ))}
          </div>
          {selectedAtoms.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedAtoms([])}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Atom Selection */}
        <div className="max-h-28 overflow-y-auto grid grid-cols-4 gap-1 rounded-lg bg-muted/30 p-2">
          {atoms.slice(0, 20).map((atom, i) => (
            <button
              key={i}
              onClick={() => handleAtomClick(i)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                selectedAtoms.includes(i)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted/50"
              }`}
            >
              {atom.element}{i + 1}
            </button>
          ))}
        </div>

        {/* Measured Angles */}
        {bondAngles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Measured Angles</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAngles}
                className="h-6 text-xs text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {bondAngles.map((angle, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-muted/30 rounded-lg px-2 py-1.5 text-xs group"
                >
                  <span>
                    {atoms[angle.atoms[0]]?.element}
                    {angle.atoms[0] + 1} —{" "}
                    <span className="text-primary font-medium">
                      {atoms[angle.atoms[1]]?.element}
                      {angle.atoms[1] + 1}
                    </span>{" "}
                    — {atoms[angle.atoms[2]]?.element}
                    {angle.atoms[2] + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-yellow-400">
                      {angle.angle.toFixed(1)}°
                    </span>
                    <button
                      onClick={() => onRemoveAngle(i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BondAnglePanel;
