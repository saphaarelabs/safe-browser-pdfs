import { useState } from "react";
import { FileJson } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToJsonPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState("");

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const result: { pages: { pageNumber: number; text: string; lines: string[] }[] } = { pages: [] };
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const lines: string[] = [];
        let currentLine = "";
        let lastY: number | null = null;
        for (const item of content.items) {
          const t = item as { str: string; transform: number[] };
          const y = t.transform[5];
          if (lastY !== null && Math.abs(y - lastY) > 2) {
            if (currentLine.trim()) lines.push(currentLine.trim());
            currentLine = "";
          }
          currentLine += t.str;
          lastY = y;
        }
        if (currentLine.trim()) lines.push(currentLine.trim());
        result.pages.push({ pageNumber: i, text: lines.join("\n"), lines });
      }
      const json = JSON.stringify(result, null, 2);
      setPreview(json.slice(0, 2000));
      const blob = new Blob([json], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", ".json");
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="PDF to JSON" description="Extract PDF text into structured JSON format." accentColor="hsl(40, 80%, 50%)" icon={<FileJson className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Selected: <strong>{file.name}</strong></p>
          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={processing}>{processing ? "Converting…" : "Convert to JSON"}</Button>
            <Button variant="outline" onClick={() => { setFile(null); setPreview(""); }}>Clear</Button>
          </div>
          {preview && <pre className="max-h-64 overflow-auto rounded border bg-secondary p-3 text-xs">{preview}</pre>}
        </div>
      )}
    </ToolPageLayout>
  );
};

export default PdfToJsonPage;
