import { useState } from "react";
import { FileDown } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MarkdownToPdfPage = () => {
  const [md, setMd] = useState("# Hello World\n\nThis is a **Markdown** document.\n\n- Item 1\n- Item 2\n- Item 3\n\n## Section Two\n\nSome more text here.");

  const simpleMarkdownToHtml = (text: string) => {
    return text
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
      .replace(/^(?!<[hul])(.*\S.*)$/gm, "<p>$1</p>")
      .replace(/\n{2,}/g, "");
  };

  const handlePrint = () => {
    const html = simpleMarkdownToHtml(md);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Markdown PDF</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.6;color:#222}h1{font-size:28px}h2{font-size:22px}h3{font-size:18px}ul{padding-left:20px}p{margin:10px 0}</style></head><body>${html}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <ToolPageLayout title="Markdown to PDF" description="Convert Markdown text to a PDF document." accentColor="hsl(250, 60%, 55%)" icon={<FileDown className="h-5 w-5" />}>
      <div className="space-y-4">
        <label className="text-sm font-medium">Paste or write your Markdown</label>
        <Textarea value={md} onChange={(e) => setMd(e.target.value)} rows={14} className="font-mono text-xs" />
        <div className="flex gap-2">
          <Button onClick={handlePrint} disabled={!md.trim()}>Print / Save as PDF</Button>
          <Button variant="outline" onClick={() => setMd("")}>Clear</Button>
        </div>
        <p className="text-xs text-muted-foreground">A print dialog will open — choose "Save as PDF" as destination.</p>
      </div>
    </ToolPageLayout>
  );
};

export default MarkdownToPdfPage;
