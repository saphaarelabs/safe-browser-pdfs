import { Heart, Github } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-card/50 py-8">
    <div className="container mx-auto px-4 text-center">
      <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
        Made with <Heart className="h-4 w-4 text-destructive" /> — 100% open source
      </p>
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <Github className="h-4 w-4" />
        Star on GitHub
      </a>
    </div>
  </footer>
);

export default Footer;
