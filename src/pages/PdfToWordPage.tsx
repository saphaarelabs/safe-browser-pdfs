import { useState, useCallback } from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Document, Paragraph, TextRun, Packer } from "docx";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToWordPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
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
          if (lastY !== null && Math.abs(t.transform[5] - lastY) > 5) lines.push("\n");
          lines.push(t.str);
          lastY = t.transform[5];
        }
        const pageText = lines.join(" ").replace(/ \n /g, "\n");
        for (const line of pageText.split("\n")) {
          paragraphs.push(new Paragraph({ children: [new TextRun({ text: line.trim(), size: 24 })] }));
        }
        if (i < pdf.numPages) paragraphs.push(new Paragraph({ children: [], pageBreakBefore: true }));
      }
      const doc = new Document({ sections: [{ children: paragraphs }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, file.name.replace(/\.pdf$/i, ".docx"));
      toast.success("Converted to Word!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to convert.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="PDF to Word" description="Convert PDF to editable Word document." accentColor="hsl(221, 83%, 53%)" icon={<FileText className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file" sublabel="or click to browse" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>Choose different file</Button>
            </CardContent>
          </Card>
          <Button onClick={handleConvert} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Converting…" : "Convert to Word (.docx)"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default PdfToWordPage;
