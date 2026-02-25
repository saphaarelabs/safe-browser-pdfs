import { Link } from "react-router-dom";
import { Github, FileText, Heart } from "lucide-react";

const footerSections = [
  {
    title: "Edit",
    links: [
      { name: "Merge PDFs", path: "/merge" },
      { name: "Split PDF", path: "/split" },
      { name: "Compress PDF", path: "/compress" },
      { name: "Rotate PDF", path: "/rotate" },
      { name: "Watermark", path: "/watermark" },
      { name: "Page Numbers", path: "/page-numbers" },
      { name: "Organize Pages", path: "/organize" },
      { name: "Edit Metadata", path: "/edit-metadata" },
      { name: "Sign PDF", path: "/sign" },
      { name: "Crop PDF", path: "/crop" },
      { name: "Flatten PDF", path: "/flatten" },
      { name: "Grayscale PDF", path: "/grayscale" },
      { name: "Delete Pages", path: "/delete-pages" },
      { name: "Extract Pages", path: "/extract-pages" },
      { name: "Repair PDF", path: "/repair" },
      { name: "Reverse PDF", path: "/reverse" },
      { name: "Redact PDF", path: "/redact" },
      { name: "Add Bookmarks", path: "/add-bookmarks" },
      { name: "PDF Annotate", path: "/annotate" },
      { name: "Header/Footer", path: "/header-footer" },
      { name: "Duplicate Pages", path: "/duplicate-pages" },
      { name: "Add QR Code", path: "/add-qr-code" },
      { name: "Remove Blank Pages", path: "/remove-blank-pages" },
      { name: "Stamp PDF", path: "/stamp" },
      { name: "Resize PDF", path: "/resize-pdf" },
    ],
  },
  {
    title: "Convert",
    links: [
      { name: "PDF to Images", path: "/pdf-to-images" },
      { name: "Images to PDF", path: "/images-to-pdf" },
      { name: "PDF to Word", path: "/pdf-to-word" },
      { name: "PDF to PowerPoint", path: "/pdf-to-ppt" },
      { name: "PDF to Text", path: "/pdf-to-text" },
      { name: "PDF to CSV", path: "/pdf-to-csv" },
      { name: "HTML to PDF", path: "/html-to-pdf" },
      { name: "PDF to JSON", path: "/pdf-to-json" },
      { name: "PDF to HTML", path: "/pdf-to-html" },
      { name: "Excel to PDF", path: "/excel-to-pdf" },
      { name: "Word to PDF", path: "/word-to-pdf" },
      { name: "PDF to Markdown", path: "/pdf-to-markdown" },
      { name: "Markdown to PDF", path: "/markdown-to-pdf" },
      { name: "PDF to XML", path: "/pdf-to-xml" },
      { name: "PDF to TIFF", path: "/pdf-to-tiff" },
      { name: "PDF to Excel", path: "/pdf-to-excel" },
    ],
  },
  {
    title: "Images & Utility",
    links: [
      { name: "Resize Images", path: "/resize-images" },
      { name: "Compress Images", path: "/compress-images" },
      { name: "Convert Image", path: "/convert-image" },
      { name: "Crop Image", path: "/crop-image" },
      { name: "Compare PDFs", path: "/compare" },
      { name: "PDF Page Size", path: "/pdf-page-size" },
      { name: "Rotate Image", path: "/rotate-image" },
      { name: "Flip Image", path: "/flip-image" },
      { name: "Image to Base64", path: "/image-to-base64" },
      { name: "Merge Images", path: "/merge-images" },
      { name: "Protect PDF", path: "/protect" },
      { name: "Unlock PDF", path: "/unlock" },
      { name: "Batch Process", path: "/batch" },
      { name: "PDF Diff", path: "/pdf-diff" },
    ],
  },
];

const Footer = () => (
  <footer className="border-t py-12">
    <div className="container mx-auto px-4">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
              <FileText className="h-3 w-3" />
            </div>
            PDF Tools
          </Link>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
            55 free, open-source PDF tools that run entirely in your browser. No uploads, no servers, no tricks.
          </p>
          <div className="mt-4 flex flex-col gap-1.5">
            <a href="https://github.com/saphaarelabs/safe-browser-pdfs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-3.5 w-3.5" /> Star on GitHub
            </a>
            <a href="https://github.com/saphaarelabs/safe-browser-pdfs/issues" target="_blank" rel="noopener noreferrer" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              Report a Bug
            </a>
            <a href="https://github.com/saphaarelabs/safe-browser-pdfs/issues/new?title=Feature+Request" target="_blank" rel="noopener noreferrer" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              Request a Feature
            </a>
          </div>
        </div>

        {footerSections.map((section) => (
          <div key={section.title}>
            <h4 className="text-sm font-semibold mb-3">{section.title}</h4>
            <div className="flex flex-col gap-1.5">
              {section.links.map((t) => (
                <Link key={t.path} to={t.path} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t pt-6 text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          Made with <Heart className="h-3 w-3 text-red-500" /> for the community · 100% free & open source · Your files never leave your browser
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
