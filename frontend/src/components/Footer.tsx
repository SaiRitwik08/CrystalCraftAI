import { Github, Mail, Hexagon } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Version */}
          <div className="flex items-center gap-3">
            <Hexagon className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              CrystalCraft AI <span className="text-primary">v1.0.0</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="mailto:contact@crystalcraft.ai"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © 2024 CrystalCraft AI. Advanced Crystal Generation.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
