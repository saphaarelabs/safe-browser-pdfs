import { Link } from "react-router-dom";
import {
  Merge, Scissors, Minimize2, Image, RotateCw, Stamp, Hash,
  Lock, Unlock, ArrowRight, Shield, Zap, Globe, Github,
  Layers, FileSignature, FileEdit, ImagePlus, FileText,
  Presentation, FileType,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const tools = [
  { title: "Merge PDFs", desc: "Combine multiple PDFs into one document.", icon: Merge, path: "/merge", color: "hsl(221, 83%, 53%)" },
  { title: "Split PDF", desc: "Extract pages or split into smaller files.", icon: Scissors, path: "/split", color: "hsl(142, 71%, 45%)" },
  { title: "Compress PDF", desc: "Reduce file size while maintaining quality.", icon: Minimize2, path: "/compress", color: "hsl(25, 95%, 53%)" },
  { title: "PDF to Images", desc: "Convert PDF pages to PNG or JPG.", icon: Image, path: "/pdf-to-images", color: "hsl(262, 83%, 58%)" },
  { title: "Images to PDF", desc: "Convert images into a PDF document.", icon: ImagePlus, path: "/images-to-pdf", color: "hsl(45, 93%, 47%)" },
  { title: "Rotate PDF", desc: "Rotate pages by 90°, 180°, or 270°.", icon: RotateCw, path: "/rotate", color: "hsl(330, 81%, 60%)" },
  { title: "Watermark", desc: "Add text watermarks to every page.", icon: Stamp, path: "/watermark", color: "hsl(199, 89%, 48%)" },
  { title: "Page Numbers", desc: "Add page numbers in various positions.", icon: Hash, path: "/page-numbers", color: "hsl(38, 92%, 50%)" },
  { title: "Protect PDF", desc: "Encrypt your PDF with a password.", icon: Lock, path: "/protect", color: "hsl(0, 72%, 51%)" },
  { title: "Unlock PDF", desc: "Remove password protection.", icon: Unlock, path: "/unlock", color: "hsl(142, 76%, 36%)" },
  { title: "Organize Pages", desc: "Reorder, delete, or duplicate pages.", icon: Layers, path: "/organize", color: "hsl(210, 40%, 48%)" },
  { title: "Edit Metadata", desc: "Change title, author, and properties.", icon: FileEdit, path: "/edit-metadata", color: "hsl(270, 50%, 50%)" },
  { title: "Sign PDF", desc: "Add a text signature to your PDF.", icon: FileSignature, path: "/sign", color: "hsl(173, 58%, 39%)" },
  { title: "PDF to Word", desc: "Convert PDF to editable Word document.", icon: FileText, path: "/pdf-to-word", color: "hsl(221, 70%, 50%)" },
  { title: "PDF to PowerPoint", desc: "Convert PDF pages into a presentation.", icon: Presentation, path: "/pdf-to-ppt", color: "hsl(25, 90%, 50%)" },
  { title: "PDF to Text", desc: "Extract all text content from a PDF.", icon: FileType, path: "/pdf-to-text", color: "hsl(160, 60%, 40%)" },
];

const features = [
  { icon: Shield, title: "100% Private", desc: "Files never leave your browser." },
  { icon: Zap, title: "Instant", desc: "All processing happens locally." },
  { icon: Globe, title: "Works Offline", desc: "No internet required after load." },
  { icon: Github, title: "Open Source", desc: "Inspect, audit, contribute." },
];

const Index = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />

    {/* Hero */}
    <section className="border-b py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Every PDF tool you need
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground text-lg">
          Merge, split, compress, convert, and edit PDFs — entirely in your browser.
          No uploads. No servers. Free forever.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/merge">
            <Button size="lg" className="gap-2 px-6">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="https://github.com/saphaarelabs/safe-browser-pdfs" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="gap-2 px-6">
              <Github className="h-4 w-4" /> GitHub
            </Button>
          </a>
        </div>
      </div>
    </section>

    {/* Tool Grid */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-semibold tracking-tight mb-10">
          All Tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-secondary/50"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${tool.color}12`, color: tool.color }}
              >
                <tool.icon className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  {tool.title}
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-60 group-hover:translate-x-0" />
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="border-t py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Index;
