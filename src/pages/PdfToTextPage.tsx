import { useState, useCallback } from "react";
import { FileType, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfToTextPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fullText, setFullText] = useState("");

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setPreview(null);
    setFullText("");
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
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item: any) => item.str).join(" ");
        pages.push(`--- Page ${i} ---\n${text}`);
      }
      const text = pages.join("\n\n");
      setFullText(text);
      setPreview(text.slice(0, 3000));
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      saveAs(blob, file.name.replace(/\.pdf$/i, ".txt"));
      toast.success("Text extracted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to extract text.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="PDF to Text" description="Extract all text content from a PDF." accentColor="hsl(142, 71%, 45%)" icon={<FileType className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file" sublabel="or click to browse" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setPreview(null); }}>Choose different file</Button>
            </CardContent>
          </Card>
          <Button onClick={handleConvert} disabled={processing} className="w-full min-h-[44px]" size="lg">
            {processing ? "Extracting…" : "Extract Text (.txt)"}
          </Button>
          {preview && (
            <>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-semibold mb-2">Preview</p>
                  <pre className="max-h-72 overflow-auto rounded border bg-secondary/30 p-3 text-xs whitespace-pre-wrap leading-relaxed">{preview}{fullText.length > 3000 ? "\n…" : ""}</pre>
                </CardContent>
              </Card>
              <Button variant="outline" className="w-full min-h-[44px]" onClick={() => { navigator.clipboard.writeText(fullText); toast.success("Copied!"); }}>
                <Copy className="mr-2 h-4 w-4" /> Copy All Text
              </Button>
            </>
          )}
        </>
      )}
    </ToolPageLayout>
  );
};

export default PdfToTextPage;
