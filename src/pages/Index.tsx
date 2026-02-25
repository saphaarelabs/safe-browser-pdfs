import { Link } from "react-router-dom";
import { Merge, Scissors, Minimize2, Image, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const tools = [
  {
    title: "Merge PDFs",
    description: "Combine multiple PDF files into a single document. Drag to reorder.",
    icon: <Merge className="h-7 w-7" />,
    path: "/merge",
    color: "hsl(220, 85%, 58%)",
    bgClass: "bg-tool-merge/10",
    textClass: "text-tool-merge",
  },
  {
    title: "Split PDF",
    description: "Extract specific pages or split a PDF into smaller files.",
    icon: <Scissors className="h-7 w-7" />,
    path: "/split",
    color: "hsl(150, 70%, 42%)",
    bgClass: "bg-tool-split/10",
    textClass: "text-tool-split",
  },
  {
    title: "Compress PDF",
    description: "Reduce file size while keeping quality. Choose your compression level.",
    icon: <Minimize2 className="h-7 w-7" />,
    path: "/compress",
    color: "hsl(30, 90%, 55%)",
    bgClass: "bg-tool-compress/10",
    textClass: "text-tool-compress",
  },
  {
    title: "PDF to Images",
    description: "Convert PDF pages to high-quality PNG or JPG images.",
    icon: <Image className="h-7 w-7" />,
    path: "/pdf-to-images",
    color: "hsl(280, 70%, 58%)",
    bgClass: "bg-tool-images/10",
    textClass: "text-tool-images",
  },
];

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground animate-float">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
            Free PDF Tools
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground md:text-xl">
            Merge, split, compress, and convert PDFs — right in your browser.{" "}
            <span className="font-semibold text-foreground">No uploads. No servers. 100% private.</span>
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Your files never leave your browser
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Tool Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <Link key={tool.path} to={tool.path} className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
                <CardContent className="flex flex-col items-start p-6">
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${tool.bgClass} ${tool.textClass}`}
                  >
                    {tool.icon}
                  </div>
                  <h2 className="font-display text-xl font-bold">{tool.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
                  <Button
                    className="mt-4 w-full font-semibold"
                    style={{ backgroundColor: tool.color }}
                  >
                    Use Tool →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
