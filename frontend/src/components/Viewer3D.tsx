import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AtomData {
  element: string;
  x: number;
  y: number;
  z: number;
  isDefect?: boolean;
  defectType?: "vacancy" | "substitution";
}

interface BondData {
  start: THREE.Vector3;
  end: THREE.Vector3;
}

interface Viewer3DProps {
  atoms: AtomData[];
  lattice?: {
    a: number;
    b: number;
    c: number;
  };
  showSymmetry?: {
    mirrorPlanes: boolean;
    rotationAxes: boolean;
    inversionCenter: boolean;
  };
  selectedAtoms?: number[];
  bondAngles?: Array<{ atoms: [number, number, number]; angle: number }>;
}

// Element colors and radii
const elementData: Record<string, { color: string; radius: number }> = {
  H: { color: "#FFFFFF", radius: 0.25 },
  C: { color: "#909090", radius: 0.7 },
  N: { color: "#3050F8", radius: 0.65 },
  O: { color: "#FF0D0D", radius: 0.6 },
  Fe: { color: "#E06633", radius: 1.2 },
  Si: { color: "#F0C8A0", radius: 1.1 },
  Al: { color: "#BFA6A6", radius: 1.25 },
  Na: { color: "#AB5CF2", radius: 1.8 },
  Cl: { color: "#1FF01F", radius: 1.0 },
  Ca: { color: "#3DFF00", radius: 1.8 },
  Mg: { color: "#8AFF00", radius: 1.5 },
  S: { color: "#FFFF30", radius: 1.0 },
  P: { color: "#FF8000", radius: 1.0 },
  Ti: { color: "#BFC2C7", radius: 1.4 },
  Cu: { color: "#C88033", radius: 1.3 },
  Zn: { color: "#7D80B0", radius: 1.35 },
  default: { color: "#FF69B4", radius: 0.8 },
};

function getElementData(element: string) {
  return elementData[element] || elementData.default;
}

// Individual Atom component
function Atom({
  position,
  element,
  scale = 1,
  isSelected,
  isDefect,
  defectType,
}: {
  position: [number, number, number];
  element: string;
  scale: number;
  isSelected?: boolean;
  isDefect?: boolean;
  defectType?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { color, radius } = getElementData(element);

  const displayColor = useMemo(() => {
    if (defectType === "vacancy") return "#FF0000";
    if (defectType === "substitution") return "#00FF00";
    return color;
  }, [color, defectType]);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius * scale * 0.3, 32, 32]} />
      <meshStandardMaterial
        color={displayColor}
        metalness={0.3}
        roughness={0.4}
        emissive={isSelected ? "#00FFFF" : isDefect ? displayColor : "#000000"}
        emissiveIntensity={isSelected ? 0.5 : isDefect ? 0.3 : 0}
      />
      {isSelected && (
        <mesh>
          <sphereGeometry args={[radius * scale * 0.35, 16, 16]} />
          <meshBasicMaterial color="#00FFFF" transparent opacity={0.3} wireframe />
        </mesh>
      )}
    </mesh>
  );
}

// Bond component
function Bond({
  start,
  end,
  thickness = 0.05,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness: number;
}) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[thickness, thickness, length, 8]} />
      <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
    </mesh>
  );
}

// Unit cell wireframe
function UnitCell({ a, b, c }: { a: number; b: number; c: number }) {
  const points = useMemo(() => {
    const scale = 2;
    const corners = [
      [0, 0, 0],
      [a, 0, 0],
      [a, b, 0],
      [0, b, 0],
      [0, 0, c],
      [a, 0, c],
      [a, b, c],
      [0, b, c],
    ].map(([x, y, z]) => new THREE.Vector3(x * scale - a, y * scale - b / 2, z * scale - c / 2));

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    return edges.map(([i, j]) => [corners[i], corners[j]] as [THREE.Vector3, THREE.Vector3]);
  }, [a, b, c]);

  return (
    <group>
      {points.map((edge, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...edge[0].toArray(), ...edge[1].toArray()])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00FFFF" transparent opacity={0.3} />
        </line>
      ))}
    </group>
  );
}

// Symmetry overlays
function SymmetryOverlays({
  showMirrorPlanes,
  showRotationAxes,
  showInversionCenter,
}: {
  showMirrorPlanes: boolean;
  showRotationAxes: boolean;
  showInversionCenter: boolean;
}) {
  return (
    <group>
      {showMirrorPlanes && (
        <>
          <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[4, 4]} />
            <meshBasicMaterial color="#00FF00" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[4, 4]} />
            <meshBasicMaterial color="#FF00FF" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      {showRotationAxes && (
        <>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 5, 8]} />
            <meshBasicMaterial color="#FFFF00" />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 5, 8]} />
            <meshBasicMaterial color="#FF0000" />
          </mesh>
        </>
      )}
      {showInversionCenter && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      )}
    </group>
  );
}

// Angle visualization
function AngleVisualization({
  atoms,
  bondAngles,
}: {
  atoms: AtomData[];
  bondAngles: Array<{ atoms: [number, number, number]; angle: number }>;
}) {
  return (
    <group>
      {bondAngles.map((angleData, i) => {
        const [i1, i2, i3] = angleData.atoms;
        if (!atoms[i1] || !atoms[i2] || !atoms[i3]) return null;

        const p1 = new THREE.Vector3(atoms[i1].x * 4 - 2, atoms[i1].y * 4 - 2, atoms[i1].z * 4 - 2);
        const p2 = new THREE.Vector3(atoms[i2].x * 4 - 2, atoms[i2].y * 4 - 2, atoms[i2].z * 4 - 2);
        const p3 = new THREE.Vector3(atoms[i3].x * 4 - 2, atoms[i3].y * 4 - 2, atoms[i3].z * 4 - 2);

        return (
          <group key={i}>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={3}
                  array={new Float32Array([...p1.toArray(), ...p2.toArray(), ...p3.toArray()])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#FFFF00" linewidth={2} />
            </line>
          </group>
        );
      })}
    </group>
  );
}

// Scene controls
function SceneControls({
  zoomSensitivity,
  onReset,
}: {
  zoomSensitivity: number;
  onReset: () => void;
}) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.zoomSpeed = zoomSensitivity;
      controlsRef.current.rotateSpeed = 0.5;
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;
    }
  }, [zoomSensitivity]);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={20}
    />
  );
}

// Main 3D Scene
function CrystalScene({
  atoms,
  lattice,
  atomScale,
  bondThickness,
  showSymmetry,
  selectedAtoms,
  bondAngles,
  zoomSensitivity,
  bondThreshold,
  onReset,
}: Viewer3DProps & {
  atomScale: number;
  bondThickness: number;
  zoomSensitivity: number;
  bondThreshold: number;
  onReset: () => void;
}) {
  const bonds = useMemo(() => {
    const result: BondData[] = [];
    // Scaling factor is 4, so 2.5 covers 0.625 fractional distance
    const threshold = bondThreshold;

    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const a1 = atoms[i];
        const a2 = atoms[j];
        const dx = (a2.x - a1.x) * 4;
        const dy = (a2.y - a1.y) * 4;
        const dz = (a2.z - a1.z) * 4;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < threshold) {
          result.push({
            start: new THREE.Vector3(a1.x * 4 - 2, a1.y * 4 - 2, a1.z * 4 - 2),
            end: new THREE.Vector3(a2.x * 4 - 2, a2.y * 4 - 2, a2.z * 4 - 2),
          });
        }
      }
    }
    return result;
  }, [atoms, bondThreshold]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
      <SceneControls zoomSensitivity={zoomSensitivity} onReset={onReset} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-10, -10, -10]} intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#00FFFF" />

      {/* Atoms */}
      {atoms.map((atom, i) => (
        <Atom
          key={i}
          position={[atom.x * 4 - 2, atom.y * 4 - 2, atom.z * 4 - 2]}
          element={atom.element}
          scale={atomScale}
          isSelected={selectedAtoms?.includes(i)}
          isDefect={atom.isDefect}
          defectType={atom.defectType}
        />
      ))}

      {/* Bonds */}
      {bonds.map((bond, i) => (
        <Bond key={i} start={bond.start} end={bond.end} thickness={bondThickness} />
      ))}

      {/* Unit Cell */}
      {lattice && <UnitCell a={lattice.a / 5} b={lattice.b / 5} c={lattice.c / 5} />}

      {/* Symmetry Overlays */}
      {showSymmetry && (
        <SymmetryOverlays
          showMirrorPlanes={showSymmetry.mirrorPlanes}
          showRotationAxes={showSymmetry.rotationAxes}
          showInversionCenter={showSymmetry.inversionCenter}
        />
      )}

      {/* Bond Angles */}
      {bondAngles && bondAngles.length > 0 && (
        <AngleVisualization atoms={atoms} bondAngles={bondAngles} />
      )}

      <Environment preset="night" />
    </>
  );
}

// Main Viewer Component
const Viewer3D = ({
  atoms,
  lattice,
  showSymmetry,
  selectedAtoms,
  bondAngles,
}: Viewer3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [atomScale, setAtomScale] = useState(1);
  const [bondThickness, setBondThickness] = useState(0.05);
  const [zoomSensitivity, setZoomSensitivity] = useState(0.5);
  const [bondThreshold, setBondThreshold] = useState(2.5);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleReset = () => {
    setAtomScale(1);
    setBondThickness(0.05);
    setZoomSensitivity(0.5);
    setBondThreshold(2.5);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden glass-card"
    >
      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="bg-background/50 backdrop-blur-sm hover:bg-background/70"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-background/50 backdrop-blur-sm hover:bg-background/70"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Settings Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="glass-card p-3 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 min-w-[140px]">
            <span className="text-muted-foreground">Atom Size</span>
            <Slider
              value={[atomScale]}
              onValueChange={([v]) => setAtomScale(v)}
              min={0.5}
              max={2}
              step={0.1}
              className="w-20"
            />
          </div>
          <div className="flex items-center gap-2 min-w-[140px]">
            <span className="text-muted-foreground">Bond Width</span>
            <Slider
              value={[bondThickness * 20]}
              onValueChange={([v]) => setBondThickness(v / 20)}
              min={1}
              max={4}
              step={0.5}
              className="w-20"
            />
          </div>
          <div className="flex items-center gap-2 min-w-[140px]">
            <span className="text-muted-foreground">Zoom Speed</span>
            <Slider
              value={[zoomSensitivity * 2]}
              onValueChange={([v]) => setZoomSensitivity(v / 2)}
              min={0.2}
              max={2}
              step={0.1}
              className="w-20"
            />
          </div>
          <div className="flex items-center gap-2 min-w-[140px]">
            <span className="text-muted-foreground">Bond Threshold</span>
            <Slider
              value={[bondThreshold]}
              onValueChange={([v]) => setBondThreshold(v)}
              min={0}
              max={5}
              step={0.1}
              className="w-20"
            />
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        className="bg-gradient-to-b from-background to-card"
      >
        <CrystalScene
          atoms={atoms}
          lattice={lattice}
          atomScale={atomScale}
          bondThickness={bondThickness}
          showSymmetry={showSymmetry}
          selectedAtoms={selectedAtoms}
          bondAngles={bondAngles}
          zoomSensitivity={zoomSensitivity}
          bondThreshold={bondThreshold}
          onReset={handleReset}
        />
      </Canvas>
    </motion.div>
  );
};

export default Viewer3D;
