import { Link } from "react-router-dom";
import {
  Merge, Scissors, Minimize2, Image, Shield, Sparkles,
  RotateCw, Stamp, Hash, Lock, Unlock, Zap, Globe, Eye,
  ArrowRight, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const tools = [
  {
    title: "Merge PDFs",
    description: "Combine multiple PDF files into a single document with drag reordering.",
    icon: <Merge className="h-6 w-6" />,
    path: "/merge",
    bgClass: "bg-tool-merge/10",
    textClass: "text-tool-merge",
    borderClass: "hover:border-tool-merge/40",
  },
  {
    title: "Split PDF",
    description: "Extract specific pages or split into smaller files instantly.",
    icon: <Scissors className="h-6 w-6" />,
    path: "/split",
    bgClass: "bg-tool-split/10",
    textClass: "text-tool-split",
    borderClass: "hover:border-tool-split/40",
  },
  {
    title: "Compress PDF",
    description: "Reduce file size while maintaining quality. Choose compression level.",
    icon: <Minimize2 className="h-6 w-6" />,
    path: "/compress",
    bgClass: "bg-tool-compress/10",
    textClass: "text-tool-compress",
    borderClass: "hover:border-tool-compress/40",
  },
  {
    title: "PDF to Images",
    description: "Convert PDF pages to high-quality PNG or JPG images.",
    icon: <Image className="h-6 w-6" />,
    path: "/pdf-to-images",
    bgClass: "bg-tool-images/10",
    textClass: "text-tool-images",
    borderClass: "hover:border-tool-images/40",
  },
  {
    title: "Rotate PDF",
    description: "Rotate all or specific pages by 90°, 180°, or 270°.",
    icon: <RotateCw className="h-6 w-6" />,
    path: "/rotate",
    bgClass: "bg-tool-rotate/10",
    textClass: "text-tool-rotate",
    borderClass: "hover:border-tool-rotate/40",
  },
  {
    title: "Watermark PDF",
    description: "Add text watermarks to every page of your PDF.",
    icon: <Stamp className="h-6 w-6" />,
    path: "/watermark",
    bgClass: "bg-tool-watermark/10",
    textClass: "text-tool-watermark",
    borderClass: "hover:border-tool-watermark/40",
  },
  {
    title: "Page Numbers",
    description: "Add page numbers to your PDF in various positions and formats.",
    icon: <Hash className="h-6 w-6" />,
    path: "/page-numbers",
    bgClass: "bg-tool-pagenums/10",
    textClass: "text-tool-pagenums",
    borderClass: "hover:border-tool-pagenums/40",
  },
  {
    title: "Protect PDF",
    description: "Encrypt your PDF with a password to restrict access.",
    icon: <Lock className="h-6 w-6" />,
    path: "/protect",
    bgClass: "bg-tool-protect/10",
    textClass: "text-tool-protect",
    borderClass: "hover:border-tool-protect/40",
  },
  {
    title: "Unlock PDF",
    description: "Remove password protection from your PDF files.",
    icon: <Unlock className="h-6 w-6" />,
    path: "/unlock",
    bgClass: "bg-tool-unlock/10",
    textClass: "text-tool-unlock",
    borderClass: "hover:border-tool-unlock/40",
  },
];

const features = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "100% Private",
    description: "Files never leave your browser. Zero data uploaded to any server.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description: "All processing happens locally — no waiting for server responses.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Works Offline",
    description: "Once loaded, works without internet. Perfect for sensitive documents.",
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Open Source",
    description: "Fully transparent code. Inspect, audit, and contribute on GitHub.",
  },
];

const stats = [
  { value: "9", label: "PDF Tools" },
  { value: "0", label: "Files Uploaded" },
  { value: "100%", label: "Private" },
  { value: "∞", label: "Free Forever" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero py-24 md:py-36">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"
          >
            <Sparkles className="h-10 w-10" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-display text-5xl font-bold tracking-tight md:text-7xl"
          >
            Every PDF Tool
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-tool-images bg-clip-text text-transparent">
              You'll Ever Need
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
          >
            Merge, split, compress, convert, rotate, watermark, and protect your PDFs —
            entirely in your browser.{" "}
            <span className="font-semibold text-foreground">
              No uploads. No servers. 100% free & open source.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/merge">
              <Button size="lg" className="gap-2 text-base px-8 shadow-lg shadow-primary/20">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2 text-base px-8">
                <CheckCircle2 className="h-4 w-4" /> Star on GitHub
              </Button>
            </a>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-8 rounded-2xl glass-card px-8 py-4 max-w-xl"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-accent/8 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-tool-images/5 blur-3xl" />
      </section>

      {/* Tool Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold md:text-4xl">All the Tools, Zero Compromise</h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
            Professional-grade PDF tools that run entirely in your browser. Pick a tool and get started.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {tools.map((tool) => (
            <motion.div key={tool.path} variants={item}>
              <Link to={tool.path} className="group block h-full">
                <Card className={`h-full transition-all duration-300 tool-card-glow border-2 border-transparent ${tool.borderClass} hover:-translate-y-1`}>
                  <CardContent className="flex items-start gap-4 p-6">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tool.bgClass} ${tool.textClass} transition-transform duration-300 group-hover:scale-110`}
                    >
                      {tool.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold flex items-center gap-2">
                        {tool.title}
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-muted-foreground" />
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Why Choose PDF Tools?</h2>
            <p className="mt-3 text-muted-foreground text-lg">Built different from the start.</p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={item} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-tool-images/10 p-12 border border-border/50"
          >
            <h2 className="font-display text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mt-3 text-muted-foreground">
              No sign-up required. Just pick a tool and go. Your files stay on your device.
            </p>
            <Link to="/merge">
              <Button size="lg" className="mt-6 gap-2 px-8 shadow-lg shadow-primary/20">
                Try It Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
