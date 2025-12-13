import { motion } from "framer-motion";
import { Box, Ruler, Sparkles, Zap, Layers } from "lucide-react";

interface StructureDetailsProps {
  lattice?: {
    a: number;
    b: number;
    c: number;
    alpha: number;
    beta: number;
    gamma: number;
  };
  spaceGroup?: string;
  atomicPositions?: Array<{
    element: string;
    x: number;
    y: number;
    z: number;
  }>;
  bondInfo?: Array<{
    atom1: string;
    atom2: string;
    length: number;
  }>;
  metadata?: {
    energy?: number;
    formation_energy?: number;
    band_gap?: number;
  };
}

const StructureDetails = ({
  lattice,
  spaceGroup,
  atomicPositions,
  bondInfo,
  metadata,
}: StructureDetailsProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Lattice Parameters */}
      {lattice && (
        <motion.div variants={itemVariants} className="panel">
          <div className="panel-header">
            <Box className="w-4 h-4 text-primary" />
            <h3 className="panel-title">Lattice Parameters</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <span className="text-muted-foreground block text-xs">a</span>
              <span className="font-mono text-foreground">{lattice.a.toFixed(3)} Å</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <span className="text-muted-foreground block text-xs">b</span>
              <span className="font-mono text-foreground">{lattice.b.toFixed(3)} Å</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <span className="text-muted-foreground block text-xs">c</span>
              <span className="font-mono text-foreground">{lattice.c.toFixed(3)} Å</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <span className="text-muted-foreground block text-xs">α</span>
              <span className="font-mono text-foreground">{lattice.alpha.toFixed(1)}°</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <span className="text-muted-foreground block text-xs">β</span>
              <span className="font-mono text-foreground">{lattice.beta.toFixed(1)}°</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <span className="text-muted-foreground block text-xs">γ</span>
              <span className="font-mono text-foreground">{lattice.gamma.toFixed(1)}°</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Space Group */}
      {spaceGroup && (
        <motion.div variants={itemVariants} className="panel">
          <div className="panel-header">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="panel-title">Space Group</h3>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <span className="font-mono text-lg text-foreground">{spaceGroup}</span>
          </div>
        </motion.div>
      )}

      {/* Atomic Positions */}
      {atomicPositions && atomicPositions.length > 0 && (
        <motion.div variants={itemVariants} className="panel">
          <div className="panel-header">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="panel-title">Atomic Positions ({atomicPositions.length})</h3>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {atomicPositions.slice(0, 10).map((atom, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 text-xs"
              >
                <span className="font-semibold text-accent">{atom.element}</span>
                <span className="font-mono text-muted-foreground">
                  ({atom.x.toFixed(3)}, {atom.y.toFixed(3)}, {atom.z.toFixed(3)})
                </span>
              </div>
            ))}
            {atomicPositions.length > 10 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                +{atomicPositions.length - 10} more atoms
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Bond Lengths */}
      {bondInfo && bondInfo.length > 0 && (
        <motion.div variants={itemVariants} className="panel">
          <div className="panel-header">
            <Ruler className="w-4 h-4 text-primary" />
            <h3 className="panel-title">Bond Lengths</h3>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {bondInfo.slice(0, 5).map((bond, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 text-xs"
              >
                <span className="text-foreground">
                  {bond.atom1} — {bond.atom2}
                </span>
                <span className="font-mono text-primary">{bond.length.toFixed(3)} Å</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Energy Values */}
      {metadata && (metadata.energy || metadata.formation_energy || metadata.band_gap) && (
        <motion.div variants={itemVariants} className="panel">
          <div className="panel-header">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="panel-title">Energy Properties</h3>
          </div>
          <div className="space-y-2">
            {metadata.energy !== undefined && (
              <div className="flex justify-between bg-muted/30 rounded-lg px-3 py-2 text-xs">
                <span className="text-muted-foreground">Total Energy</span>
                <span className="font-mono text-foreground">{metadata.energy.toFixed(3)} eV</span>
              </div>
            )}
            {metadata.formation_energy !== undefined && (
              <div className="flex justify-between bg-muted/30 rounded-lg px-3 py-2 text-xs">
                <span className="text-muted-foreground">Formation Energy</span>
                <span className="font-mono text-foreground">{metadata.formation_energy.toFixed(3)} eV/atom</span>
              </div>
            )}
            {metadata.band_gap !== undefined && (
              <div className="flex justify-between bg-muted/30 rounded-lg px-3 py-2 text-xs">
                <span className="text-muted-foreground">Band Gap</span>
                <span className="font-mono text-foreground">{metadata.band_gap.toFixed(3)} eV</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StructureDetails;
