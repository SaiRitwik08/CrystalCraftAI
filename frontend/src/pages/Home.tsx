import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Hexagon, Atom, Zap, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Home = () => {
  const [formula, setFormula] = useState("");
  const navigate = useNavigate();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (formula.trim()) {
      navigate(`/generate?formula=${encodeURIComponent(formula.trim())}`);
    }
  };

  const exampleFormulas = ["Fe₂O₃", "SiO₂", "TiO₂", "NaCl", "CaCO₃", "Al₂O₃"];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial opacity-50" />
      
      {/* Floating Crystals */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 left-20 opacity-20"
      >
        <Hexagon className="w-24 h-24 text-primary" />
      </motion.div>
      <motion.div
        animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-48 right-32 opacity-15"
      >
        <Box className="w-32 h-32 text-accent" />
      </motion.div>
      <motion.div
        animate={{ y: [-5, 15, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-48 left-1/4 opacity-10"
      >
        <Atom className="w-20 h-20 text-crystal-cyan" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI-Powered Crystal Generation</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="text-foreground">Crystal</span>
            <span className="text-gradient">Craft</span>
            <span className="text-foreground"> AI</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Advanced crystal structure generation and visualization. 
            Enter a chemical formula and watch the magic unfold.
          </motion.p>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleGenerate}
            className="w-full max-w-xl mx-auto mb-8"
          >
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity" />
              
              <div className="relative flex gap-2 p-2 glass-card">
                <Input
                  type="text"
                  placeholder="Enter chemical formula (e.g., Fe₂O₃, SiO₂)"
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  className="flex-1 h-14 px-6 text-lg bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                />
                <Button
                  type="submit"
                  disabled={!formula.trim()}
                  className="h-14 px-8 crystal-button text-primary-foreground font-semibold"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.form>

          {/* Example Formulas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-sm text-muted-foreground">Try:</span>
            {exampleFormulas.map((f, i) => (
              <motion.button
                key={f}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                onClick={() => setFormula(f.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (m) => "0123456789"["₀₁₂₃₄₅₆₇₈₉".indexOf(m)]))}
                className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {f}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20"
        >
          {[
            {
              icon: Atom,
              title: "AI Generation",
              description: "State-of-the-art neural networks generate realistic crystal structures from formulas.",
            },
            {
              icon: Box,
              title: "3D Visualization",
              description: "Interactive viewer with smooth controls, symmetry overlays, and defect simulation.",
            },
            {
              icon: Sparkles,
              title: "Advanced Analysis",
              description: "Explore bond angles, atomic positions, and energy properties in real-time.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="glass-card p-6 group hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
