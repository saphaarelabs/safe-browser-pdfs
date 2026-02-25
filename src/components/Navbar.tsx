import { Link, useLocation } from "react-router-dom";
import { FileText, Github, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const primaryTools = [
  { name: "Merge", path: "/merge" },
  { name: "Split", path: "/split" },
  { name: "Compress", path: "/compress" },
  { name: "PDF to Images", path: "/pdf-to-images" },
];

const moreTools = [
  { name: "Rotate", path: "/rotate" },
  { name: "Watermark", path: "/watermark" },
  { name: "Page Numbers", path: "/page-numbers" },
  { name: "Protect", path: "/protect" },
  { name: "Unlock", path: "/unlock" },
];

const allTools = [...primaryTools, ...moreTools];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 font-display text-xl font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <span>PDF Tools</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {primaryTools.map((tool) => (
            <Link key={tool.path} to={tool.path}>
              <Button
                variant={location.pathname === tool.path ? "secondary" : "ghost"}
                size="sm"
                className="font-semibold"
              >
                {tool.name}
              </Button>
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 font-semibold">
                More <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {moreTools.map((tool) => (
                <Link key={tool.path} to={tool.path}>
                  <DropdownMenuItem className="cursor-pointer font-medium">
                    {tool.name}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="ml-2">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Github className="h-4 w-4" />
            </Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 md:hidden">
          {allTools.map((tool) => (
            <Link key={tool.path} to={tool.path} onClick={() => setMobileOpen(false)}>
              <Button
                variant={location.pathname === tool.path ? "secondary" : "ghost"}
                className="w-full justify-start font-semibold"
              >
                {tool.name}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
