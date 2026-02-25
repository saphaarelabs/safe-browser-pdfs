import { useState, useCallback } from "react";
import { Palette, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const GrayscalePdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFiles = useCallback((files: File[]) => { setFile(files[0]); setResult(null); }, []);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        // Desaturate
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        for (let j = 0; j < d.length; j += 4) {
          const gray = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
          d[j] = d[j + 1] = d[j + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);

        const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        const jpgBytes = Uint8Array.from(atob(jpgDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
        const img = await newPdf.embedJpg(jpgBytes);
        const pdfPage = newPdf.addPage([viewport.width / 2, viewport.height / 2]);
        pdfPage.drawImage(img, { x: 0, y: 0, width: viewport.width / 2, height: viewport.height / 2 });
        setProgress(Math.round((i / pdfDoc.numPages) * 100));
      }

      const bytes = await newPdf.save();
      setResult(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      toast.success("Converted to grayscale!");
    } catch {
      toast.error("Failed to convert to grayscale.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Grayscale PDF" description="Convert a color PDF to black and white" accentColor="hsl(0, 0%, 45%)" icon={<Palette className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF to convert to grayscale" />
      ) : (
        <>
          <Card><CardContent className="p-6">
            <p className="font-semibold">{file.name}</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setResult(null); }}>Choose different file</Button>
          </CardContent></Card>
          {processing && <Progress value={progress} className="h-2" />}
          <div className="flex gap-3">
            <Button onClick={handleConvert} disabled={processing} className="flex-1" size="lg">{processing ? `Converting… ${progress}%` : "Convert to Grayscale"}</Button>
            {result && <Button onClick={() => saveAs(result, `grayscale-${file.name}`)} size="lg" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Download</Button>}
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default GrayscalePdfPage;
