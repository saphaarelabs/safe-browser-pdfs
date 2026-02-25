import { useState, useCallback, useEffect } from "react";
import { Minimize2, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

type Quality = "low" | "medium" | "high";

const qualitySettings: Record<Quality, { label: string; scale: number; description: string }> = {
  low: { label: "Low", scale: 0.5, description: "Smallest file, lower quality" },
  medium: { label: "Medium", scale: 0.72, description: "Good balance" },
  high: { label: "High", scale: 0.92, description: "Best quality, larger file" },
};

const CompressPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<Quality>("medium");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    setFile(files[0]);
    setResult(null);
  }, []);

  // Animated progress during processing
  useEffect(() => {
    if (!processing) { setProgress(0); return; }
    let v = 0;
    const interval = setInterval(() => {
      v = Math.min(v + Math.random() * 15, 90);
      setProgress(v);
    }, 200);
    return () => clearInterval(interval);
  }, [processing]);

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);
    try {
      const buffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const scale = qualitySettings[quality].scale;
        if (scale < 1) {
          page.setSize(width * scale, height * scale);
          page.scaleContent(scale, scale);
        }
        newPdf.addPage(page);
      });
      const compressedBytes = await newPdf.save();
      const blob = new Blob([compressedBytes as BlobPart], { type: "application/pdf" });
      setProgress(100);
      setResult({ blob, size: compressedBytes.byteLength });
      toast.success("PDF compressed!");
    } catch (err) {
      toast.error("Failed to compress PDF.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const savedPercent = result && file ? Math.round((1 - result.size / file.size) * 100) : 0;

  return (
    <ToolPageLayout
      title="Compress PDF"
      description="Reduce PDF file size"
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
                  Original size: {(file.size / 1024).toFixed(0)} KB
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
              <RadioGroup value={quality} onValueChange={(v) => { setQuality(v as Quality); setResult(null); }}>
                {(Object.entries(qualitySettings) as [Quality, typeof qualitySettings["low"]][]).map(([key, val]) => (
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
              <p className="text-xs text-muted-foreground text-center">Compressing… {Math.round(progress)}%</p>
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
                    style={{ width: `${100 - savedPercent}%` }}
                  />
                </div>
                <p className="text-center text-sm font-medium mt-2 text-primary">
                  {savedPercent > 0 ? `${savedPercent}% smaller` : "No size reduction (file may already be optimized)"}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleCompress}
              disabled={processing}
              className="flex-1 min-h-[44px]"
              size="lg"
            >
              {processing ? "Compressing…" : "Compress"}
            </Button>
            {result && (
              <Button
                onClick={() => saveAs(result.blob, `compressed-${file!.name}`)}
                size="lg"
                variant="outline"
                className="gap-2 min-h-[44px]"
              >
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
