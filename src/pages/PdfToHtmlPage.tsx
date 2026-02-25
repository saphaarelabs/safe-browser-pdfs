import { useState } from "react";
import { Code2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToHtmlPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState("");

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
      setPreview(html.slice(0, 2000));
      const blob = new Blob([html], { type: "text/html" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", ".html");
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="PDF to HTML" description="Convert PDF content into a semantic HTML document." accentColor="hsl(20, 80%, 50%)" icon={<Code2 className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Selected: <strong>{file.name}</strong></p>
          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={processing}>{processing ? "Converting…" : "Convert to HTML"}</Button>
            <Button variant="outline" onClick={() => { setFile(null); setPreview(""); }}>Clear</Button>
          </div>
          {preview && <pre className="max-h-64 overflow-auto rounded border bg-secondary p-3 text-xs">{preview}</pre>}
        </div>
      )}
    </ToolPageLayout>
  );
};

export default PdfToHtmlPage;
