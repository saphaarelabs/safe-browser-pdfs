import { Link, useLocation } from "react-router-dom";
import { FileText, Github, Menu, X, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainTools = [
  { name: "Merge", path: "/merge" },
  { name: "Split", path: "/split" },
  { name: "Compress", path: "/compress" },
  { name: "Convert", path: "/pdf-to-images" },
  { name: "Rotate", path: "/rotate" },
  { name: "Sign", path: "/sign" },
];

const moreTools = [
  { name: "Watermark", path: "/watermark" },
  { name: "Page Numbers", path: "/page-numbers" },
  { name: "Organize Pages", path: "/organize" },
  { name: "Edit Metadata", path: "/edit-metadata" },
  { name: "Images to PDF", path: "/images-to-pdf" },
  { name: "PDF to Word", path: "/pdf-to-word" },
  { name: "PDF to PowerPoint", path: "/pdf-to-ppt" },
  { name: "PDF to Text", path: "/pdf-to-text" },
  { name: "PDF to CSV", path: "/pdf-to-csv" },
  { name: "Protect PDF", path: "/protect" },
  { name: "Unlock PDF", path: "/unlock" },
  { name: "Crop PDF", path: "/crop" },
  { name: "Flatten PDF", path: "/flatten" },
  { name: "Grayscale PDF", path: "/grayscale" },
  { name: "Delete Pages", path: "/delete-pages" },
  { name: "Extract Pages", path: "/extract-pages" },
  { name: "Repair PDF", path: "/repair" },
  { name: "HTML to PDF", path: "/html-to-pdf" },
  { name: "Resize Images", path: "/resize-images" },
  { name: "Compress Images", path: "/compress-images" },
  { name: "Reverse PDF", path: "/reverse" },
  { name: "Convert Image", path: "/convert-image" },
  { name: "Crop Image", path: "/crop-image" },
  { name: "PDF to JSON", path: "/pdf-to-json" },
  { name: "PDF Page Size", path: "/pdf-page-size" },
  { name: "Redact PDF", path: "/redact" },
  { name: "Add Bookmarks", path: "/add-bookmarks" },
  { name: "PDF to HTML", path: "/pdf-to-html" },
  { name: "Compare PDFs", path: "/compare" },
  { name: "Excel to PDF", path: "/excel-to-pdf" },
  { name: "Word to PDF", path: "/word-to-pdf" },
  { name: "PDF Annotate", path: "/annotate" },
  { name: "PDF to Markdown", path: "/pdf-to-markdown" },
  { name: "Markdown to PDF", path: "/markdown-to-pdf" },
  { name: "Header/Footer", path: "/header-footer" },
  { name: "PDF to XML", path: "/pdf-to-xml" },
  { name: "Duplicate Pages", path: "/duplicate-pages" },
  { name: "Add QR Code", path: "/add-qr-code" },
  { name: "PDF to TIFF", path: "/pdf-to-tiff" },
  { name: "Rotate Image", path: "/rotate-image" },
  { name: "Flip Image", path: "/flip-image" },
  { name: "Image to Base64", path: "/image-to-base64" },
  { name: "Batch Process", path: "/batch" },
  { name: "PDF Diff", path: "/pdf-diff" },
  { name: "Remove Blank Pages", path: "/remove-blank-pages" },
  { name: "PDF to Excel", path: "/pdf-to-excel" },
  { name: "Stamp PDF", path: "/stamp" },
  { name: "Merge Images", path: "/merge-images" },
  { name: "Resize PDF", path: "/resize-pdf" },
];

const allTools = [...mainTools, ...moreTools];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

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
          {mainTools.map((tool) => (
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-[13px] font-medium text-muted-foreground hover:text-foreground gap-1">
                More <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
              {moreTools.map((tool) => (
                <Link key={tool.path} to={tool.path}>
                  <DropdownMenuItem className={`text-[13px] ${location.pathname === tool.path ? "bg-secondary" : ""}`}>
                    {tool.name}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-2 h-4 w-px bg-border" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <a href="https://github.com/saphaarelabs/safe-browser-pdfs" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Github className="h-4 w-4" />
            </Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background px-4 pb-3 md:hidden max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-1 pt-2">
            {allTools.map((tool) => (
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
            <a href="https://github.com/saphaarelabs/safe-browser-pdfs" target="_blank" rel="noopener noreferrer">
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
