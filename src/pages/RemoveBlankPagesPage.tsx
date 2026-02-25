import { useState, useCallback } from "react";
import { FileX, Download } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const RemoveBlankPagesPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [blankPages, setBlankPages] = useState<number[] | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setBlankPages(null);
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      setPageCount(pdf.numPages);
    } catch { toast.error("Could not read PDF."); }
  }, []);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const blanks: number[] = [];

      // Analyze each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, vp.width, vp.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        const imageData = ctx.getImageData(0, 0, vp.width, vp.height);
        let nonWhitePixels = 0;
        for (let j = 0; j < imageData.data.length; j += 4) {
          if (imageData.data[j] < 250 || imageData.data[j + 1] < 250 || imageData.data[j + 2] < 250) {
            nonWhitePixels++;
          }
        }
        const totalPixels = vp.width * vp.height;
        if (nonWhitePixels / totalPixels < 0.005) blanks.push(i);
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      setBlankPages(blanks);

      if (blanks.length === 0) {
        toast.success("No blank pages found!");
        return;
      }

      // Remove blank pages
      const pdfLib = await PDFDocument.load(buffer);
      const keepIndices = Array.from({ length: pdfLib.getPageCount() }, (_, i) => i)
        .filter((i) => !blanks.includes(i + 1));

      if (keepIndices.length === 0) {
        toast.error("All pages are blank — can't create an empty PDF.");
        return;
      }

      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(pdfLib, keepIndices);
      pages.forEach((p) => newDoc.addPage(p));
      const out = await newDoc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", "-no-blanks.pdf");
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`Removed ${blanks.length} blank page(s)!`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to process PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Remove Blank Pages" description="Auto-detect and remove blank pages from your PDF." accentColor="hsl(350, 65%, 50%)" icon={<FileX className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setBlankPages(null); }}>Choose different file</Button>
            </CardContent>
          </Card>

          {blankPages !== null && (
            <Card>
              <CardContent className="p-6">
                {blankPages.length === 0 ? (
                  <p className="text-sm font-semibold text-green-600">✅ No blank pages found!</p>
                ) : (
                  <>
                    <p className="text-sm font-semibold">{blankPages.length} blank page(s) detected</p>
                    <p className="text-xs text-muted-foreground mt-1">Pages: {blankPages.join(", ")}</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {processing && <Progress value={progress} className="h-2" />}

          <Button onClick={handleProcess} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? `Analyzing… ${progress}%` : "Detect & Remove Blank Pages"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default RemoveBlankPagesPage;
