import { useState, useCallback } from "react";
import { FileText, Download, Copy } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToMarkdownPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [markdown, setMarkdown] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setMarkdown("");
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      setPageCount(pdf.numPages);
    } catch { toast.error("Could not read PDF."); }
  }, []);

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
      toast.success("Converted to Markdown!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to convert.");
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
    URL.revokeObjectURL(a.href);
  };

  return (
    <ToolPageLayout title="PDF to Markdown" description="Convert PDF text content to Markdown format." accentColor="hsl(220, 70%, 55%)" icon={<FileText className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} accept=".pdf" label="Drop a PDF here" />
      ) : !markdown ? (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>Choose different file</Button>
            </CardContent>
          </Card>
          <Button onClick={handleConvert} disabled={processing} className="w-full min-h-[44px]" size="lg">
            {processing ? "Converting…" : "Convert to Markdown"}
          </Button>
        </>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold mb-2">Output Preview</p>
              <pre className="max-h-72 overflow-auto rounded border bg-secondary/30 p-3 text-xs whitespace-pre-wrap">{markdown.slice(0, 3000)}{markdown.length > 3000 ? "\n…" : ""}</pre>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1 min-h-[44px]" size="lg"><Download className="mr-2 h-4 w-4" /> Download .md</Button>
            <Button variant="outline" className="min-h-[44px]" size="lg" onClick={() => { navigator.clipboard.writeText(markdown); toast.success("Copied!"); }}><Copy className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" onClick={() => { setFile(null); setMarkdown(""); }} className="w-full min-h-[44px]">Start Over</Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default PdfToMarkdownPage;
