import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Merge, Scissors, Minimize2, Image, RotateCw, Stamp, Hash,
  Lock, Unlock, ArrowRight, Shield, Zap, Globe, Github,
  Layers, FileSignature, FileEdit, ImagePlus, FileText,
  Presentation, FileType, Search, Crop, FileCheck, Palette,
  Table, Trash2, FileUp, Wrench, Code, Scaling, ImageDown,
  CheckCircle, X as XIcon, ArrowDownUp, ImageIcon, FileJson,
  Ruler, EyeOff, Bookmark, Code2, GitCompare, Sheet, Highlighter,
  Upload, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const tools = [
  // Edit (19)
  { title: "Merge PDFs", desc: "Combine multiple PDFs into one document.", icon: Merge, path: "/merge", color: "hsl(221, 83%, 53%)", category: "edit" },
  { title: "Split PDF", desc: "Extract pages or split into smaller files.", icon: Scissors, path: "/split", color: "hsl(142, 71%, 45%)", category: "edit" },
  { title: "Compress PDF", desc: "Reduce file size while maintaining quality.", icon: Minimize2, path: "/compress", color: "hsl(25, 95%, 53%)", category: "edit" },
  { title: "Rotate PDF", desc: "Rotate pages by 90°, 180°, or 270°.", icon: RotateCw, path: "/rotate", color: "hsl(330, 81%, 60%)", category: "edit" },
  { title: "Watermark", desc: "Add text watermarks to every page.", icon: Stamp, path: "/watermark", color: "hsl(199, 89%, 48%)", category: "edit" },
  { title: "Page Numbers", desc: "Add page numbers in various positions.", icon: Hash, path: "/page-numbers", color: "hsl(38, 92%, 50%)", category: "edit" },
  { title: "Organize Pages", desc: "Reorder, delete, or duplicate pages.", icon: Layers, path: "/organize", color: "hsl(210, 40%, 48%)", category: "edit" },
  { title: "Edit Metadata", desc: "Change title, author, and properties.", icon: FileEdit, path: "/edit-metadata", color: "hsl(270, 50%, 50%)", category: "edit" },
  { title: "Sign PDF", desc: "Add a text signature to your PDF.", icon: FileSignature, path: "/sign", color: "hsl(173, 58%, 39%)", category: "edit" },
  { title: "Crop PDF", desc: "Trim margins and crop PDF pages.", icon: Crop, path: "/crop", color: "hsl(340, 65%, 47%)", category: "edit" },
  { title: "Flatten PDF", desc: "Remove form fields and interactive elements.", icon: FileCheck, path: "/flatten", color: "hsl(200, 60%, 45%)", category: "edit" },
  { title: "Grayscale PDF", desc: "Convert a color PDF to black and white.", icon: Palette, path: "/grayscale", color: "hsl(0, 0%, 45%)", category: "edit" },
  { title: "Delete Pages", desc: "Remove specific pages from your PDF.", icon: Trash2, path: "/delete-pages", color: "hsl(0, 65%, 50%)", category: "edit" },
  { title: "Extract Pages", desc: "Pull specific pages into a new PDF.", icon: FileUp, path: "/extract-pages", color: "hsl(280, 55%, 50%)", category: "edit" },
  { title: "Repair PDF", desc: "Fix corrupted or broken PDF files.", icon: Wrench, path: "/repair", color: "hsl(30, 70%, 45%)", category: "edit" },
  { title: "Reverse PDF", desc: "Reverse the page order of your PDF.", icon: ArrowDownUp, path: "/reverse", color: "hsl(260, 60%, 55%)", category: "edit" },
  { title: "Redact PDF", desc: "Black out sensitive content permanently.", icon: EyeOff, path: "/redact", color: "hsl(0, 0%, 20%)", category: "edit" },
  { title: "Add Bookmarks", desc: "Add named bookmarks for navigation.", icon: Bookmark, path: "/add-bookmarks", color: "hsl(45, 80%, 45%)", category: "edit" },
  { title: "PDF Annotate", desc: "Highlight and annotate PDF pages.", icon: Highlighter, path: "/annotate", color: "hsl(50, 80%, 45%)", category: "edit" },
  // Security (2)
  { title: "Protect PDF", desc: "Encrypt your PDF with a password.", icon: Lock, path: "/protect", color: "hsl(0, 72%, 51%)", category: "security" },
  { title: "Unlock PDF", desc: "Remove password protection.", icon: Unlock, path: "/unlock", color: "hsl(142, 76%, 36%)", category: "security" },
  // Convert (9)
  { title: "PDF to Images", desc: "Convert PDF pages to PNG or JPG.", icon: Image, path: "/pdf-to-images", color: "hsl(262, 83%, 58%)", category: "convert" },
  { title: "Images to PDF", desc: "Convert images into a PDF document.", icon: ImagePlus, path: "/images-to-pdf", color: "hsl(45, 93%, 47%)", category: "convert" },
  { title: "PDF to Word", desc: "Convert PDF to editable Word document.", icon: FileText, path: "/pdf-to-word", color: "hsl(221, 70%, 50%)", category: "convert" },
  { title: "PDF to PowerPoint", desc: "Convert PDF pages into a presentation.", icon: Presentation, path: "/pdf-to-ppt", color: "hsl(25, 90%, 50%)", category: "convert" },
  { title: "PDF to Text", desc: "Extract all text content from a PDF.", icon: FileType, path: "/pdf-to-text", color: "hsl(160, 60%, 40%)", category: "convert" },
  { title: "PDF to CSV", desc: "Extract tabular data into CSV format.", icon: Table, path: "/pdf-to-csv", color: "hsl(150, 60%, 40%)", category: "convert" },
  { title: "HTML to PDF", desc: "Convert HTML code to a PDF document.", icon: Code, path: "/html-to-pdf", color: "hsl(250, 60%, 55%)", category: "convert" },
  { title: "PDF to JSON", desc: "Extract PDF text into structured JSON.", icon: FileJson, path: "/pdf-to-json", color: "hsl(40, 80%, 50%)", category: "convert" },
  { title: "PDF to HTML", desc: "Convert PDF into a semantic HTML page.", icon: Code2, path: "/pdf-to-html", color: "hsl(20, 80%, 50%)", category: "convert" },
  { title: "Excel to PDF", desc: "Convert Excel spreadsheets to PDF.", icon: Sheet, path: "/excel-to-pdf", color: "hsl(140, 60%, 40%)", category: "convert" },
  { title: "Word to PDF", desc: "Convert Word documents to PDF.", icon: FileText, path: "/word-to-pdf", color: "hsl(217, 70%, 50%)", category: "convert" },
  // Image (4)
  { title: "Resize Images", desc: "Resize images to specific dimensions.", icon: Scaling, path: "/resize-images", color: "hsl(180, 50%, 40%)", category: "image" },
  { title: "Compress Images", desc: "Reduce image file size with quality control.", icon: ImageDown, path: "/compress-images", color: "hsl(55, 70%, 45%)", category: "image" },
  { title: "Convert Image", desc: "Convert between PNG, JPG, and WebP.", icon: ImageIcon, path: "/convert-image", color: "hsl(300, 55%, 50%)", category: "image" },
  { title: "Crop Image", desc: "Crop images by specifying dimensions.", icon: Crop, path: "/crop-image", color: "hsl(15, 70%, 50%)", category: "image" },
  // Utility (2)
  { title: "Compare PDFs", desc: "Compare two PDFs and highlight differences.", icon: GitCompare, path: "/compare", color: "hsl(200, 70%, 50%)", category: "utility" },
  { title: "PDF Page Size", desc: "Analyze page dimensions of your PDF.", icon: Ruler, path: "/pdf-page-size", color: "hsl(190, 60%, 45%)", category: "utility" },
  // Phase 4 — new tools (12)
  { title: "PDF to Markdown", desc: "Convert PDF text to Markdown format.", icon: FileText, path: "/pdf-to-markdown", color: "hsl(220, 70%, 55%)", category: "convert" },
  { title: "Markdown to PDF", desc: "Convert Markdown text to PDF.", icon: FileType, path: "/markdown-to-pdf", color: "hsl(250, 60%, 55%)", category: "convert" },
  { title: "Add Header/Footer", desc: "Add custom text headers and footers.", icon: Layers, path: "/header-footer", color: "hsl(170, 55%, 45%)", category: "edit" },
  { title: "PDF to XML", desc: "Extract PDF text into structured XML.", icon: Code, path: "/pdf-to-xml", color: "hsl(30, 70%, 50%)", category: "convert" },
  { title: "Duplicate Pages", desc: "Duplicate specific pages N times.", icon: Layers, path: "/duplicate-pages", color: "hsl(280, 60%, 55%)", category: "edit" },
  { title: "Add QR Code", desc: "Embed a QR code on every PDF page.", icon: Hash, path: "/add-qr-code", color: "hsl(200, 65%, 50%)", category: "edit" },
  { title: "PDF to TIFF", desc: "Convert PDF pages to images in a ZIP.", icon: Image, path: "/pdf-to-tiff", color: "hsl(310, 55%, 50%)", category: "convert" },
  { title: "Rotate Image", desc: "Rotate images by 90°, 180°, or 270°.", icon: RotateCw, path: "/rotate-image", color: "hsl(340, 65%, 55%)", category: "image" },
  { title: "Flip Image", desc: "Flip images horizontally or vertically.", icon: ImageIcon, path: "/flip-image", color: "hsl(190, 60%, 50%)", category: "image" },
  { title: "Image to Base64", desc: "Convert images to Base64-encoded strings.", icon: Code2, path: "/image-to-base64", color: "hsl(270, 55%, 55%)", category: "image" },
  { title: "Batch Process", desc: "Apply operations to multiple PDFs at once.", icon: Upload, path: "/batch", color: "hsl(150, 55%, 45%)", category: "utility" },
  { title: "PDF Diff", desc: "Compare text content of two PDFs.", icon: GitCompare, path: "/pdf-diff", color: "hsl(35, 70%, 50%)", category: "utility" },
  // Phase 5 — new tools
  { title: "Remove Blank Pages", desc: "Auto-detect and remove blank pages.", icon: Trash2, path: "/remove-blank-pages", color: "hsl(350, 65%, 50%)", category: "edit" },
  { title: "PDF to Excel", desc: "Extract tabular data into Excel.", icon: Table, path: "/pdf-to-excel", color: "hsl(140, 65%, 40%)", category: "convert" },
  { title: "Stamp PDF", desc: "Add image stamps to every page.", icon: Stamp, path: "/stamp", color: "hsl(280, 55%, 50%)", category: "edit" },
  { title: "Merge Images", desc: "Stitch images together into one.", icon: ImagePlus, path: "/merge-images", color: "hsl(160, 55%, 45%)", category: "image" },
  { title: "Resize PDF", desc: "Change page dimensions with scaling.", icon: Scaling, path: "/resize-pdf", color: "hsl(210, 60%, 50%)", category: "edit" },
];

const categories = [
  { key: "all", label: "All" },
  { key: "edit", label: "Edit" },
  { key: "convert", label: "Convert" },
  { key: "security", label: "Security" },
  { key: "image", label: "Images" },
  { key: "utility", label: "Utility" },
];

const features = [
  { icon: Shield, title: "100% Private", desc: "Files never leave your browser. Zero uploads." },
  { icon: Zap, title: "Lightning Fast", desc: "All processing happens locally on your device." },
  { icon: Globe, title: "Works Offline", desc: "No internet required after the first load." },
  { icon: Github, title: "Open Source", desc: "Inspect, audit, and contribute on GitHub." },
];

const faqs = [
  { q: "Is it really free?", a: "Yes, completely free with no limits. There are no premium tiers, no watermarks, and no file size restrictions. The tools run entirely in your browser." },
  { q: "Are my files safe and private?", a: "Absolutely. Your files never leave your device. All processing happens locally in your browser using WebAssembly and JavaScript. We have zero servers that handle your files — there's nothing to hack or leak." },
  { q: "Does it work offline?", a: "Yes! Once the page loads, all tools work without an internet connection. You can even install it as a PWA for true offline access." },
  { q: "What's the maximum file size?", a: "There's no hard limit — it depends on your device's available memory. Most modern devices handle PDFs up to 100MB+ without issues." },
  { q: "How is this different from iLovePDF or Smallpdf?", a: "Unlike cloud-based tools, your files are never uploaded to any server. This means faster processing, complete privacy, and no file size limits. Plus, it's open source — you can verify exactly what the code does." },
  { q: "Can I contribute or report bugs?", a: "Yes! The project is open source on GitHub. You can report issues, suggest features, or submit pull requests. We welcome all contributions." },
];

const comparison = [
  { feature: "Privacy", us: "Files never leave your browser", them: "Files uploaded to their servers" },
  { feature: "Speed", us: "Instant local processing", them: "Upload → process → download" },
  { feature: "File size limit", us: "No limit (device memory)", them: "Often 25-100MB limits" },
  { feature: "Cost", us: "100% free, forever", them: "Free tier with paid upgrades" },
  { feature: "Offline support", us: "Full offline capability", them: "Requires internet" },
  { feature: "Open source", us: "Fully open source", them: "Proprietary code" },
  { feature: "Ads", us: "Zero ads", them: "Ads on free tier" },
];

const howItWorks = [
  { step: "1", title: "Choose a tool", desc: "Pick from 55 free tools — editing, converting, images, and more." },
  { step: "2", title: "Upload your file", desc: "Drag & drop or browse. Your file stays on your device — nothing is uploaded." },
  { step: "3", title: "Download the result", desc: "Processed instantly in your browser. Download and you're done." },
];

const Index = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filteredTools = tools.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || t.category === category;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    document.title = "PDF Tools — 55 Free Online PDF Tools | Edit, Convert & More";
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="border-b py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            <Shield className="h-3 w-3" /> 100% browser-based — your files never leave your device
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Every PDF tool you need
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground text-lg">
            {tools.length} free tools to merge, split, compress, convert, and edit PDFs — entirely in your browser.
            No uploads. No servers. Free forever.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Heart className="h-3 w-3 text-red-500" /> Built by the community, for the community. 100% open source.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/merge">
              <Button size="lg" className="gap-2 px-6">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="https://github.com/saphaarelabs/safe-browser-pdfs" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2 px-6">
                <Github className="h-4 w-4" /> Star on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-semibold tracking-tight mb-2">How It Works</h2>
          <p className="text-center text-sm text-muted-foreground mb-10">Three simple steps — no sign-up, no uploads, no nonsense.</p>
          <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
            {howItWorks.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold">{s.step}</div>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-semibold tracking-tight mb-2">All Tools</h2>
          <p className="text-center text-sm text-muted-foreground mb-6">{tools.length} free tools — everything happens in your browser</p>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {categories.map((c) => {
              const count = c.key === "all" ? tools.length : tools.filter((t) => t.category === c.key).length;
              return (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${category === c.key ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                >
                  {c.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="mx-auto mb-8 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tools…" className="pl-9 pr-9" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <Link key={tool.path} to={tool.path} className="group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-secondary/50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${tool.color}12`, color: tool.color }}>
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
          {filteredTools.length === 0 && (
            <p className="text-center text-muted-foreground mt-8">No tools found matching "{search}"</p>
          )}
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

      {/* Comparison */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-semibold tracking-tight mb-2">Why Choose Us?</h2>
          <p className="text-center text-sm text-muted-foreground mb-8">See how we compare to cloud-based PDF tools</p>
          <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium">Feature</th>
                  <th className="px-4 py-3 text-left font-medium">PDF Tools</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Others</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{row.feature}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3.5 w-3.5" /> {row.us}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="border-t py-16 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Built for the Community</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            This project is completely free and open source. No ads, no tracking, no premium tiers. Help us grow by contributing or spreading the word.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://github.com/saphaarelabs/safe-browser-pdfs" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2"><Github className="h-4 w-4" /> Star on GitHub</Button>
            </a>
            <a href="https://github.com/saphaarelabs/safe-browser-pdfs/issues" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">Report a Bug</Button>
            </a>
            <a href="https://github.com/saphaarelabs/safe-browser-pdfs/issues/new?title=Feature+Request" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">Request a Feature</Button>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-semibold tracking-tight mb-2">Frequently Asked Questions</h2>
          <p className="text-center text-sm text-muted-foreground mb-8">Everything you need to know about our PDF tools</p>
          <div className="mx-auto max-w-2xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
