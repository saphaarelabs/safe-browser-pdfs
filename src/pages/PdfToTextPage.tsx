import { useState } from "react";
import { FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToTextPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item: any) => item.str).join(" ");
        pages.push(`--- Page ${i} ---\n${text}`);
      }

      const fullText = pages.join("\n\n");
      setPreview(fullText.slice(0, 2000));
      const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
      const name = file.name.replace(/\.pdf$/i, ".txt");
      saveAs(blob, name);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="PDF to Text"
      description="Extract all text content from a PDF."
      accentColor="hsl(142, 71%, 45%)"
      icon={<FileType className="h-5 w-5" />}
    >
      {!file ? (
        <FileDropZone onFiles={(f) => { setFile(f[0]); setPreview(null); }} label="Drop a PDF file" sublabel="or click to browse" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2 text-sm">
              <FileType className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{file.name}</span>
              <span className="text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview(null); }}>Remove</Button>
          </div>
          <Button onClick={handleConvert} disabled={processing} className="w-full">
            {processing ? "Extracting…" : "Extract Text (.txt)"}
          </Button>
          {preview && (
            <div className="rounded-lg border bg-secondary/30 p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Preview (first 2000 chars)</p>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-relaxed">{preview}</pre>
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
};

export default PdfToTextPage;
