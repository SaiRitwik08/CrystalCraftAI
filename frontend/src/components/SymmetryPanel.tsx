import { motion } from "framer-motion";
import { Hexagon, FlipHorizontal, RotateCw, Circle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SymmetryPanelProps {
  symmetry: {
    mirrorPlanes: boolean;
    rotationAxes: boolean;
    inversionCenter: boolean;
  };
  onSymmetryChange: (key: keyof SymmetryPanelProps["symmetry"], value: boolean) => void;
}

const SymmetryPanel = ({ symmetry, onSymmetryChange }: SymmetryPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="panel"
    >
      <div className="panel-header">
        <Hexagon className="w-4 h-4 text-primary" />
        <h3 className="panel-title">Symmetry Explorer</h3>
      </div>

      <div className="space-y-4">
        {/* Mirror Planes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <FlipHorizontal className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <Label htmlFor="mirror" className="text-sm font-medium">Mirror Planes</Label>
              <p className="text-xs text-muted-foreground">Show reflection symmetry</p>
            </div>
          </div>
          <Switch
            id="mirror"
            checked={symmetry.mirrorPlanes}
            onCheckedChange={(checked) => onSymmetryChange("mirrorPlanes", checked)}
          />
        </div>

        {/* Rotation Axes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <RotateCw className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <Label htmlFor="rotation" className="text-sm font-medium">Rotation Axes</Label>
              <p className="text-xs text-muted-foreground">Show rotational symmetry</p>
            </div>
          </div>
          <Switch
            id="rotation"
            checked={symmetry.rotationAxes}
            onCheckedChange={(checked) => onSymmetryChange("rotationAxes", checked)}
          />
        </div>

        {/* Inversion Center */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Circle className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <Label htmlFor="inversion" className="text-sm font-medium">Inversion Center</Label>
              <p className="text-xs text-muted-foreground">Show point of inversion</p>
            </div>
          </div>
          <Switch
            id="inversion"
            checked={symmetry.inversionCenter}
            onCheckedChange={(checked) => onSymmetryChange("inversionCenter", checked)}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground mb-2">Legend</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">Mirror</span>
          <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">Rotation</span>
          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">Inversion</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SymmetryPanel;
