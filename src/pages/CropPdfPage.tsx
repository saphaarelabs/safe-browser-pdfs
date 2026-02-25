import { useState, useCallback } from "react";
import { Crop, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import PdfViewer from "@/components/PdfViewer";
import { toast } from "sonner";

const CropPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [cropPoints, setCropPoints] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    const buffer = await f.arrayBuffer();
    setFileBytes(buffer);
    setCropPoints(null);
    setClickCount(0);
  }, []);

  const handleCanvasClick = useCallback((x: number, y: number, pw: number, ph: number) => {
    const nx = x / pw;
    const ny = y / ph;
    if (clickCount === 0) {
      setCropPoints({ x1: nx, y1: ny, x2: nx, y2: ny });
      setClickCount(1);
      toast.info("Now click the opposite corner of your crop area");
    } else {
      setCropPoints((prev) => prev ? { ...prev, x2: nx, y2: ny } : null);
      setClickCount(2);
    }
  }, [clickCount]);

  const handleCrop = async () => {
    if (!file || !fileBytes || !cropPoints) return;
    setProcessing(true);
    try {
      const pdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const pages = pdf.getPages();
      const x1 = Math.min(cropPoints.x1, cropPoints.x2);
      const y1 = Math.min(cropPoints.y1, cropPoints.y2);
      const x2 = Math.max(cropPoints.x1, cropPoints.x2);
      const y2 = Math.max(cropPoints.y1, cropPoints.y2);

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        // pdf-lib uses bottom-left origin; canvas click uses top-left
        const left = x1 * width;
        const bottom = (1 - y2) * height;
        const cropW = (x2 - x1) * width;
        const cropH = (y2 - y1) * height;
        page.setCropBox(left, bottom, cropW, cropH);
      });

      const bytes = await pdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `cropped-${file.name}`);
      toast.success("PDF cropped!");
    } catch {
      toast.error("Failed to crop PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Crop PDF" description="Click two corners on the preview to define your crop area" accentColor="hsl(340, 65%, 47%)" icon={<Crop className="h-5 w-5" />}>
      {!file || !fileBytes ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF to crop" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {clickCount === 0 && "Click the top-left corner of your crop area"}
                {clickCount === 1 && "Now click the bottom-right corner"}
                {clickCount === 2 && "Crop area set! Click 'Crop PDF' to apply."}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => { setFile(null); setFileBytes(null); setCropPoints(null); setClickCount(0); }}>
              Change file
            </Button>
          </div>

          <PdfViewer
            fileBytes={fileBytes}
            onCanvasClick={handleCanvasClick}
            overlay={
              cropPoints && clickCount === 2 ? (
                <div
                  className="absolute border-2 border-dashed border-primary bg-primary/10 pointer-events-none"
                  style={{
                    left: `${Math.min(cropPoints.x1, cropPoints.x2) * 100}%`,
                    top: `${Math.min(cropPoints.y1, cropPoints.y2) * 100}%`,
                    width: `${Math.abs(cropPoints.x2 - cropPoints.x1) * 100}%`,
                    height: `${Math.abs(cropPoints.y2 - cropPoints.y1) * 100}%`,
                  }}
                />
              ) : null
            }
          />

          <div className="flex gap-3">
            <Button onClick={handleCrop} disabled={processing || clickCount < 2} className="flex-1 min-h-[44px]" size="lg">
              {processing ? "Cropping…" : "Crop PDF"}
            </Button>
            {clickCount > 0 && (
              <Button variant="outline" size="lg" className="min-h-[44px]" onClick={() => { setCropPoints(null); setClickCount(0); }}>
                Reset
              </Button>
            )}
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default CropPdfPage;
