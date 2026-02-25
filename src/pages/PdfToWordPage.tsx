import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Document, Paragraph, TextRun, Packer } from "docx";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToWordPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      const paragraphs: Paragraph[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const lines: string[] = [];
        let lastY: number | null = null;

        for (const item of content.items) {
          const t = item as any;
          if (lastY !== null && Math.abs(t.transform[5] - lastY) > 5) {
            lines.push("\n");
          }
          lines.push(t.str);
          lastY = t.transform[5];
        }

        const pageText = lines.join(" ").replace(/ \n /g, "\n");
        const textLines = pageText.split("\n");

        for (const line of textLines) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: line.trim(), size: 24 })],
            })
          );
        }

        if (i < pdf.numPages) {
          paragraphs.push(new Paragraph({ children: [], pageBreakBefore: true }));
        }
      }

      const doc = new Document({
        sections: [{ children: paragraphs }],
      });

      const blob = await Packer.toBlob(doc);
      const name = file.name.replace(/\.pdf$/i, ".docx");
      saveAs(blob, name);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="PDF to Word"
      description="Convert PDF to editable Word document."
      accentColor="hsl(221, 83%, 53%)"
      icon={<FileText className="h-5 w-5" />}
    >
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} label="Drop a PDF file" sublabel="or click to browse" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{file.name}</span>
              <span className="text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Remove</Button>
          </div>
          <Button onClick={handleConvert} disabled={processing} className="w-full">
            {processing ? "Converting…" : "Convert to Word (.docx)"}
          </Button>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default PdfToWordPage;
