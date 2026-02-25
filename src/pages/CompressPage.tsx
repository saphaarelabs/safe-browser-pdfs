import { useState, useCallback } from "react";
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
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    setFile(files[0]);
    setResult(null);
  }, []);

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);
    try {
      const buffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      
      // Create new PDF, copy pages — pdf-lib strips unused objects on save
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((page) => {
        // Scale page content based on quality (resize approach)
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
      setResult({ blob, size: compressedBytes.byteLength });
      toast.success("PDF compressed!");
    } catch (err) {
      toast.error("Failed to compress PDF.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Compress PDF"
      description="Reduce PDF file size"
      accentColor="hsl(30, 90%, 55%)"
      icon={<Minimize2 className="h-7 w-7" />}
    >
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                Original size: {(file.size / 1024).toFixed(0)} KB
              </p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setResult(null); }}>
                Choose different file
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

          {processing && <Progress value={60} className="h-2" />}

          {result && (
            <Card className="border-tool-compress/30 bg-tool-compress/5">
              <CardContent className="p-6 text-center">
                <p className="text-lg font-bold">
                  {(file.size / 1024).toFixed(0)} KB → {(result.size / 1024).toFixed(0)} KB
                </p>
                <p className="text-sm text-muted-foreground">
                  {((1 - result.size / file.size) * 100).toFixed(0)}% smaller
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleCompress}
              disabled={processing}
              className="flex-1 bg-tool-compress text-white hover:bg-tool-compress/90"
              size="lg"
            >
              {processing ? "Compressing…" : "Compress"}
            </Button>
            {result && (
              <Button
                onClick={() => saveAs(result.blob, `compressed-${file.name}`)}
                size="lg"
                variant="outline"
                className="gap-2"
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
