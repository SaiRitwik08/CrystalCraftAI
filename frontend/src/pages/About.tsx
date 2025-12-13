import { motion } from "framer-motion";
import { Hexagon, Github, Mail, ExternalLink, Cpu, Atom, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  const features = [
    {
      icon: Cpu,
      title: "AI-Powered Generation",
      description:
        "Our neural network models analyze chemical formulas and generate physically accurate crystal structures using state-of-the-art machine learning.",
    },
    {
      icon: Atom,
      title: "Professional Visualization",
      description:
        "Experience smooth, responsive 3D rendering with adjustable atom sizes, bond thicknesses, and camera controls rivaling desktop applications.",
    },
    {
      icon: Sparkles,
      title: "Advanced Analysis Tools",
      description:
        "Explore symmetry operations, simulate defects, and measure bond angles with intuitive interactive panels.",
    },
    {
      icon: Shield,
      title: "Scientific Accuracy",
      description:
        "Generated structures include accurate lattice parameters, space groups, and atomic positions validated against crystallographic databases.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Hexagon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            About <span className="text-gradient">CrystalCraft AI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced crystal structure generation and visualization powered by artificial intelligence.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 mb-16"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Built with Modern Technology
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "React", desc: "UI Framework" },
              { name: "Three.js", desc: "3D Graphics" },
              { name: "Tailwind CSS", desc: "Styling" },
              { name: "TypeScript", desc: "Type Safety" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="text-center p-4 rounded-xl bg-muted/30"
              >
                <p className="font-semibold text-foreground">{tech.name}</p>
                <p className="text-xs text-muted-foreground">{tech.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" asChild className="gap-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a href="mailto:contact@crystalcraft.ai">
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          CrystalCraft AI v1.0.0 • Built with passion for crystallography
        </motion.p>
      </div>
    </div>
  );
};

export default About;
