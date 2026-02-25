import { Link } from "react-router-dom";
import { Heart, Github, FileText } from "lucide-react";

const toolLinks = [
  { name: "Merge PDFs", path: "/merge" },
  { name: "Split PDF", path: "/split" },
  { name: "Compress PDF", path: "/compress" },
  { name: "PDF to Images", path: "/pdf-to-images" },
  { name: "Rotate PDF", path: "/rotate" },
  { name: "Watermark PDF", path: "/watermark" },
  { name: "Page Numbers", path: "/page-numbers" },
  { name: "Protect PDF", path: "/protect" },
  { name: "Unlock PDF", path: "/unlock" },
];

const Footer = () => (
  <footer className="border-t bg-muted/30 py-12">
    <div className="container mx-auto px-4">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </div>
            PDF Tools
          </Link>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
            Free, open-source PDF tools that run entirely in your browser. Your files never leave your device.
          </p>
        </div>

        {/* Tools */}
        <div>
          <h4 className="font-display font-bold mb-3">Tools</h4>
          <div className="grid grid-cols-2 gap-1">
            {toolLinks.map((t) => (
              <Link
                key={t.path}
                to={t.path}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-display font-bold mb-3">Project</h4>
          <div className="flex flex-col gap-1">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" /> Source Code
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Report a Bug
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t pt-6 text-center">
        <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          Made with <Heart className="h-3.5 w-3.5 text-destructive" /> — 100% free & open source
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
