import { useState, useCallback } from "react";
import { Minimize2, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { pdfjsLib } from "@/lib/pdfjs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

type Quality = "minimum" | "balanced" | "maximum";

const qualitySettings: Record<Quality, { label: string; jpeg: number; scale: number; description: string }> = {
  minimum: { label: "Minimum Size", jpeg: 0.40, scale: 1, description: "Smallest file — JPEG 40% quality" },
  balanced: { label: "Balanced", jpeg: 0.65, scale: 1.5, description: "Good balance — JPEG 65% quality" },
  maximum: { label: "Maximum Quality", jpeg: 0.88, scale: 2, description: "Best quality — JPEG 88%" },
};

const CompressPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [quality, setQuality] = useState<Quality>("balanced");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResult(null);
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch {
      toast.error("Could not read PDF.");
    }
  }, []);

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);
    setProgress(0);
    try {
      const buffer = await file.arrayBuffer();
      const srcPdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const newPdf = await PDFDocument.create();
      const settings = qualitySettings[quality];
      const totalPages = srcPdf.numPages;

      for (let i = 1; i <= totalPages; i++) {
        const page = await srcPdf.getPage(i);
        const viewport = page.getViewport({ scale: settings.scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        // Convert to JPEG blob at specified quality
        const jpegBlob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), "image/jpeg", settings.jpeg)
        );
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const jpegImage = await newPdf.embedJpg(jpegBytes);

        // Get original page dimensions to preserve them
        const origViewport = page.getViewport({ scale: 1 });
        const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
        newPage.drawImage(jpegImage, {
          x: 0,
          y: 0,
          width: origViewport.width,
          height: origViewport.height,
        });

        setProgress(Math.round((i / totalPages) * 100));
      }

      const compressedBytes = await newPdf.save();
      const blob = new Blob([compressedBytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, size: compressedBytes.byteLength });
      toast.success("PDF compressed!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to compress PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const savedPercent = result && file ? Math.round((1 - result.size / file.size) * 100) : 0;

  return (
    <ToolPageLayout
      title="Compress PDF"
      description="Reduce PDF file size by re-rendering pages as compressed JPEG images"
      accentColor="hsl(30, 90%, 55%)"
      icon={<Minimize2 className="h-5 w-5" />}
    >
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold truncate max-w-[200px]">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {pageCount} pages · {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => { setFile(null); setResult(null); }}>
                Change file
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <Label className="font-semibold">Compression Level</Label>
              <p className="text-xs text-muted-foreground">Each page is rendered to a canvas and re-embedded as a compressed JPEG image. Original page dimensions are preserved.</p>
              <RadioGroup value={quality} onValueChange={(v) => { setQuality(v as Quality); setResult(null); }}>
                {(Object.entries(qualitySettings) as [Quality, typeof qualitySettings["balanced"]][]).map(([key, val]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key}>
                      {val.label} <span className="text-xs text-muted-foreground">— {val.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {processing && (
            <div className="space-y-1.5">
              <Progress value={progress} className="h-2.5 transition-all" />
              <p className="text-xs text-muted-foreground text-center">Rendering page {Math.ceil((progress / 100) * pageCount)} of {pageCount}… {progress}%</p>
            </div>
          )}

          {result && file && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Before</span>
                  <span className="text-sm text-muted-foreground">After</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold">{(file.size / 1024).toFixed(0)} KB</span>
                  <span className="text-2xl">→</span>
                  <span className="text-lg font-bold text-primary">{(result.size / 1024).toFixed(0)} KB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(100 - savedPercent, 5)}%` }}
                  />
                </div>
                <p className="text-center text-sm font-medium mt-2 text-primary">
                  {savedPercent > 0 ? `${savedPercent}% smaller` : "File size increased — the original may already be well-optimized"}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button onClick={handleCompress} disabled={processing} className="flex-1 min-h-[44px]" size="lg">
              {processing ? `Compressing… ${progress}%` : "Compress"}
            </Button>
            {result && (
              <Button onClick={() => saveAs(result.blob, `compressed-${file!.name}`)} size="lg" variant="outline" className="gap-2 min-h-[44px]">
                <Download className="h-4 w-4" /> Download
              </Button>
            )}
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default CompressPage;
