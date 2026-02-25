import { useState, useCallback } from "react";
import { Code2, Download, Copy } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToHtmlPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [output, setOutput] = useState("");

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setOutput("");
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
      let html = `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>${file.name}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6}.page{margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid #ddd}h2{color:#333;font-size:1rem}</style></head>\n<body>\n`;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        html += `<div class="page"><h2>Page ${i}</h2>\n`;
        let lastY: number | null = null;
        let paragraph = "";
        for (const item of content.items) {
          const t = item as { str: string; transform: number[] };
          const y = t.transform[5];
          if (lastY !== null && Math.abs(y - lastY) > 5) {
            if (paragraph.trim()) html += `<p>${paragraph.trim()}</p>\n`;
            paragraph = "";
          }
          paragraph += t.str + " ";
          lastY = y;
        }
        if (paragraph.trim()) html += `<p>${paragraph.trim()}</p>\n`;
        html += `</div>\n`;
      }
      html += `</body>\n</html>`;
      setOutput(html);
      toast.success("Converted! Preview below.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to convert.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file!.name.replace(".pdf", ".html");
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <ToolPageLayout title="PDF to HTML" description="Convert PDF content into a semantic HTML document." accentColor="hsl(20, 80%, 50%)" icon={<Code2 className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} accept=".pdf" label="Drop a PDF here" />
      ) : !output ? (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>Choose different file</Button>
            </CardContent>
          </Card>
          <Button onClick={handleConvert} disabled={processing} className="w-full min-h-[44px]" size="lg">
            {processing ? "Converting…" : "Convert to HTML"}
          </Button>
        </>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold mb-2">Output Preview</p>
              <pre className="max-h-72 overflow-auto rounded border bg-secondary/30 p-3 text-xs whitespace-pre-wrap">{output.slice(0, 3000)}{output.length > 3000 ? "\n…" : ""}</pre>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1 min-h-[44px]" size="lg"><Download className="mr-2 h-4 w-4" /> Download .html</Button>
            <Button variant="outline" className="min-h-[44px]" size="lg" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }}><Copy className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" onClick={() => { setFile(null); setOutput(""); }} className="w-full min-h-[44px]">Start Over</Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default PdfToHtmlPage;
