import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface ToolPageLayoutProps {
  title: string;
  description: string;
  accentColor: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ToolPageLayout = ({ title, description, accentColor, icon, children }: ToolPageLayoutProps) => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All tools
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex items-center gap-4"
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground shadow-lg"
            style={{ backgroundColor: accentColor, boxShadow: `0 8px 24px -4px ${accentColor}40` }}
          >
            {icon}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {children}
        </motion.div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Your files never leave your browser — all processing happens locally.
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default ToolPageLayout;
