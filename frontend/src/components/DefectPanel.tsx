import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Replace, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AtomData {
  element: string;
  x: number;
  y: number;
  z: number;
  isDefect?: boolean;
  defectType?: "vacancy" | "substitution";
}

interface DefectPanelProps {
  atoms: AtomData[];
  selectedAtomIndex: number | null;
  onSelectAtom: (index: number | null) => void;
  onApplyDefect: (atomIndex: number, defectType: "vacancy" | "substitution", newElement?: string) => void;
  onClearDefects: () => void;
}

const DefectPanel = ({
  atoms,
  selectedAtomIndex,
  onSelectAtom,
  onApplyDefect,
  onClearDefects,
}: DefectPanelProps) => {
  const [defectType, setDefectType] = useState<"vacancy" | "substitution">("vacancy");
  const [substituteElement, setSubstituteElement] = useState("");

  const handleApplyDefect = () => {
    if (selectedAtomIndex === null) return;
    onApplyDefect(selectedAtomIndex, defectType, substituteElement || undefined);
    onSelectAtom(null);
  };

  const defectCount = atoms.filter((a) => a.isDefect).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="panel"
    >
      <div className="panel-header">
        <AlertCircle className="w-4 h-4 text-primary" />
        <h3 className="panel-title">Defect Simulator</h3>
      </div>

      <div className="space-y-4">
        {/* Atom Selection */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            Select Atom ({defectCount} defects applied)
          </Label>
          <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg bg-muted/30 p-2">
            {atoms.slice(0, 20).map((atom, i) => (
              <button
                key={i}
                onClick={() => onSelectAtom(selectedAtomIndex === i ? null : i)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                  selectedAtomIndex === i
                    ? "bg-primary/20 text-primary"
                    : atom.isDefect
                    ? "bg-destructive/20 text-destructive"
                    : "hover:bg-muted/50"
                }`}
              >
                <span className="font-medium">{atom.element}</span>
                <span className="text-muted-foreground font-mono">
                  {i + 1}
                </span>
                {atom.isDefect && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/30">
                    {atom.defectType}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Defect Type */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Defect Type</Label>
          <RadioGroup
            value={defectType}
            onValueChange={(v) => setDefectType(v as "vacancy" | "substitution")}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="vacancy" id="vacancy" />
              <Label htmlFor="vacancy" className="flex items-center gap-1.5 text-sm cursor-pointer">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                Vacancy
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="substitution" id="substitution" />
              <Label htmlFor="substitution" className="flex items-center gap-1.5 text-sm cursor-pointer">
                <Replace className="w-3.5 h-3.5 text-green-400" />
                Substitution
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Substitute Element */}
        {defectType === "substitution" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Label htmlFor="substitute" className="text-xs text-muted-foreground mb-2 block">
              Substitute Element
            </Label>
            <Input
              id="substitute"
              placeholder="e.g., Na, Mg, Al"
              value={substituteElement}
              onChange={(e) => setSubstituteElement(e.target.value)}
              className="h-8 text-sm"
            />
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleApplyDefect}
            disabled={selectedAtomIndex === null}
            size="sm"
            className="flex-1 crystal-button h-8 text-xs"
          >
            Apply Defect
          </Button>
          <Button
            onClick={onClearDefects}
            variant="outline"
            size="sm"
            disabled={defectCount === 0}
            className="h-8 text-xs"
          >
            Clear All
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DefectPanel;
