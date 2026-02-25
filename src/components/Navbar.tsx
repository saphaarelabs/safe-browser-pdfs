import { Link, useLocation } from "react-router-dom";
import { FileText, Github, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const tools = [
  { name: "Merge", path: "/merge" },
  { name: "Split", path: "/split" },
  { name: "Compress", path: "/compress" },
  { name: "Convert", path: "/pdf-to-images" },
  { name: "Rotate", path: "/rotate" },
  { name: "Watermark", path: "/watermark" },
  { name: "Organize", path: "/organize" },
  { name: "Sign", path: "/sign" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <span>PDF Tools</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 md:flex">
          {tools.map((tool) => (
            <Link key={tool.path} to={tool.path}>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-[13px] font-medium ${
                  location.pathname === tool.path
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tool.name}
              </Button>
            </Link>
          ))}

          <div className="ml-2 h-4 w-px bg-border" />

          <a href="https://github.com/nicholasxdavis/pdf-tools" target="_blank" rel="noopener noreferrer" className="ml-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Github className="h-4 w-4" />
            </Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background px-4 pb-3 md:hidden">
          <div className="grid grid-cols-2 gap-1 pt-2">
            {tools.map((tool) => (
              <Link key={tool.path} to={tool.path} onClick={() => setMobileOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start text-[13px] font-medium ${
                    location.pathname === tool.path
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {tool.name}
                </Button>
              </Link>
            ))}
          </div>
          <div className="mt-2 border-t pt-2">
            <a href="https://github.com/nicholasxdavis/pdf-tools" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-[13px] text-muted-foreground">
                <Github className="h-3.5 w-3.5" /> GitHub
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
