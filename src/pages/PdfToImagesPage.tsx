import { useState, useCallback, useEffect } from "react";
import { Image as ImageIcon, Download } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

type Format = "png" | "jpeg";

const PdfToImagesPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [format, setFormat] = useState<Format>("png");
  const [scale, setScale] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setImages([]);
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      setPageCount(pdf.numPages);
    } catch {
      toast.error("Could not read this PDF.");
    }
  }, []);

  // Cleanup object URLs
  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.url));
  }, [images]);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setImages([]);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const total = pdf.numPages;
      const results: { url: string; name: string }[] = [];

      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const blob = await new Promise<Blob>((res) =>
          canvas.toBlob((b) => res(b!), mimeType, 0.92)
        );
        const url = URL.createObjectURL(blob);
        const ext = format === "png" ? "png" : "jpg";
        results.push({ url, name: `page-${i}.${ext}` });
        setProgress(Math.round((i / total) * 100));
      }

      setImages(results);
      toast.success("Conversion complete!");
    } catch (err) {
      toast.error("Failed to convert PDF.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    for (const img of images) {
      const resp = await fetch(img.url);
      const blob = await resp.blob();
      zip.file(img.name, blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "pdf-images.zip");
  };

  return (
    <ToolPageLayout
      title="PDF to Images"
      description="Convert PDF pages to PNG or JPG images"
      accentColor="hsl(280, 70%, 58%)"
      icon={<ImageIcon className="h-5 w-5" />}
    >
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setImages([]); setPageCount(0); }}>
                Choose different file
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label className="font-semibold">Format</Label>
                <RadioGroup value={format} onValueChange={(v) => setFormat(v as Format)} className="mt-2 flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="png" id="png" />
                    <Label htmlFor="png">PNG</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="jpeg" id="jpeg" />
                    <Label htmlFor="jpeg">JPG</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label className="font-semibold">Resolution: {scale}x</Label>
                <Slider value={[scale]} onValueChange={(v) => setScale(v[0])} min={1} max={4} step={0.5} className="mt-2" />
                <p className="mt-1 text-xs text-muted-foreground">Higher = better quality, larger files</p>
              </div>
            </CardContent>
          </Card>

          {processing && <Progress value={progress} className="h-2" />}

          <Button
            onClick={handleConvert}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? `Converting… ${progress}%` : "Convert to Images"}
          </Button>

          {images.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{images.length} images generated</p>
                <Button onClick={downloadAll} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Download All (ZIP)
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {images.map((img) => (
                  <Card key={img.name} className="overflow-hidden">
                    <img src={img.url} alt={img.name} className="w-full" />
                    <CardContent className="flex items-center justify-between p-3">
                      <span className="text-xs text-muted-foreground">{img.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => saveAs(img.url, img.name)}>
                        <Download className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </ToolPageLayout>
  );
};

export default PdfToImagesPage;
