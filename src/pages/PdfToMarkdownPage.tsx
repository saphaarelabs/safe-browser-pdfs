import { useState } from "react";
import { FileText } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToMarkdownPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      let md = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const lines: string[] = [];
        let lastY: number | null = null;
        let line = "";
        for (const item of content.items as any[]) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            lines.push(line.trim());
            line = "";
          }
          line += item.str;
          lastY = item.transform[5];
        }
        if (line.trim()) lines.push(line.trim());
        if (i > 1) md += "\n---\n\n";
        md += `## Page ${i}\n\n`;
        for (const l of lines) {
          if (!l) continue;
          if (l.length < 60 && l === l.toUpperCase() && /[A-Z]/.test(l)) {
            md += `### ${l}\n\n`;
          } else {
            md += `${l}\n\n`;
          }
        }
      }
      setMarkdown(md.trim());
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file!.name.replace(".pdf", ".md");
    a.click();
  };

  return (
    <ToolPageLayout title="PDF to Markdown" description="Convert PDF text content to Markdown format." accentColor="hsl(220, 70%, 55%)" icon={<FileText className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".pdf" label="Drop a PDF here" />
      ) : !markdown ? (
        <div className="space-y-4">
          <p className="text-sm">Selected: <strong>{file.name}</strong></p>
          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={processing}>{processing ? "Converting…" : "Convert to Markdown"}</Button>
            <Button variant="outline" onClick={() => setFile(null)}>Clear</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Textarea value={markdown} readOnly rows={16} className="font-mono text-xs" />
          <div className="flex gap-2">
            <Button onClick={handleDownload}>Download .md</Button>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(markdown); }}>Copy</Button>
            <Button variant="outline" onClick={() => { setFile(null); setMarkdown(""); }}>Start Over</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default PdfToMarkdownPage;
