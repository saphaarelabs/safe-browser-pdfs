import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface ToolPageLayoutProps {
  title: string;
  description: string;
  accentColor: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ToolPageLayout = ({ title, description, accentColor, icon, children }: ToolPageLayoutProps) => {
  useEffect(() => {
    document.title = `${title} — Free Online PDF Tool | PDF Tools`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", `${description}. 100% free, private, and works entirely in your browser. No uploads, no servers.`);
  }, [title, description]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-10">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-6 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground text-[13px]">
              <ArrowLeft className="h-3.5 w-3.5" /> All tools
            </Button>
          </Link>

          <div className="mb-8 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              {icon}
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {children}
          </div>

          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            Files are processed locally — nothing is uploaded.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ToolPageLayout;
