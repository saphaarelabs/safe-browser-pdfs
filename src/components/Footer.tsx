import { Link } from "react-router-dom";
import { Github, FileText } from "lucide-react";

const toolLinks = [
  { name: "Merge PDFs", path: "/merge" },
  { name: "Split PDF", path: "/split" },
  { name: "Compress PDF", path: "/compress" },
  { name: "PDF to Images", path: "/pdf-to-images" },
  { name: "Images to PDF", path: "/images-to-pdf" },
  { name: "Rotate PDF", path: "/rotate" },
  { name: "Watermark PDF", path: "/watermark" },
  { name: "Page Numbers", path: "/page-numbers" },
  { name: "Protect PDF", path: "/protect" },
  { name: "Unlock PDF", path: "/unlock" },
  { name: "Organize Pages", path: "/organize" },
  { name: "Edit Metadata", path: "/edit-metadata" },
  { name: "Sign PDF", path: "/sign" },
  { name: "PDF to Word", path: "/pdf-to-word" },
  { name: "PDF to PPT", path: "/pdf-to-ppt" },
  { name: "PDF to Text", path: "/pdf-to-text" },
];

const Footer = () => (
  <footer className="border-t py-12">
    <div className="container mx-auto px-4">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
              <FileText className="h-3 w-3" />
            </div>
            PDF Tools
          </Link>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
            Free, open-source PDF tools that run entirely in your browser. No uploads, no servers.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Tools</h4>
          <div className="grid grid-cols-2 gap-y-1.5">
            {toolLinks.map((t) => (
              <Link
                key={t.path}
                to={t.path}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Project</h4>
          <div className="flex flex-col gap-1.5">
            <a
              href="https://github.com/saphaarelabs/safe-browser-pdfs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-3.5 w-3.5" /> Source Code
            </a>
            <a
              href="https://github.com/saphaarelabs/safe-browser-pdfs/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Report a Bug
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          100% free & open source · Your files never leave your browser
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
