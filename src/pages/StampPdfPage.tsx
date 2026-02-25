import { useState, useCallback, useRef, useEffect } from "react";
import { Stamp, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const StampPdfPage = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [stampUrl, setStampUrl] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState("center");
  const [stampSize, setStampSize] = useState([30]);
  const [opacity, setOpacity] = useState([50]);
  const [processing, setProcessing] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const handlePdfFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setPdfFile(f);
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      setPageCount(pdf.numPages);
    } catch { toast.error("Could not read PDF."); }
  }, []);

  const handleStampFiles = useCallback((files: File[]) => {
    const f = files[0];
    setStampFile(f);
    setStampUrl(URL.createObjectURL(f));
  }, []);

  // Live preview
  useEffect(() => {
    if (!pdfFile || !stampUrl || !previewRef.current) return;
    (async () => {
      try {
        const buffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 1 });
        const scale = 300 / vp.width;
        const svp = page.getViewport({ scale });
        const canvas = previewRef.current!;
        canvas.width = svp.width;
        canvas.height = svp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: svp }).promise;

        // Draw stamp
        const img = new window.Image();
        img.src = stampUrl;
        await new Promise((r) => (img.onload = r));
        const sw = canvas.width * (stampSize[0] / 100);
        const sh = (sw / img.naturalWidth) * img.naturalHeight;
        let x = (canvas.width - sw) / 2;
        let y = (canvas.height - sh) / 2;
        if (position === "top-left") { x = 10; y = 10; }
        else if (position === "top-right") { x = canvas.width - sw - 10; y = 10; }
        else if (position === "bottom-left") { x = 10; y = canvas.height - sh - 10; }
        else if (position === "bottom-right") { x = canvas.width - sw - 10; y = canvas.height - sh - 10; }
        ctx.globalAlpha = opacity[0] / 100;
        ctx.drawImage(img, x, y, sw, sh);
        ctx.globalAlpha = 1;
      } catch { /* preview error ok */ }
    })();
  }, [pdfFile, stampUrl, position, stampSize, opacity]);

  const handleStamp = async () => {
    if (!pdfFile || !stampFile) return;
    setProcessing(true);
    try {
      const pdfBuffer = await pdfFile.arrayBuffer();
      const doc = await PDFDocument.load(pdfBuffer);
      const stampBuffer = await stampFile.arrayBuffer();
      const stampBytes = new Uint8Array(stampBuffer);
      const stampImage = stampFile.type === "image/png"
        ? await doc.embedPng(stampBytes)
        : await doc.embedJpg(stampBytes);

      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        const sw = width * (stampSize[0] / 100);
        const sh = (sw / stampImage.width) * stampImage.height;
        let x = (width - sw) / 2;
        let y = (height - sh) / 2;
        if (position === "top-left") { x = 20; y = height - sh - 20; }
        else if (position === "top-right") { x = width - sw - 20; y = height - sh - 20; }
        else if (position === "bottom-left") { x = 20; y = 20; }
        else if (position === "bottom-right") { x = width - sw - 20; y = 20; }
        page.drawImage(stampImage, { x, y, width: sw, height: sh, opacity: opacity[0] / 100 });
      }

      const out = await doc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = pdfFile.name.replace(".pdf", "-stamped.pdf");
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Stamp applied to all pages!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to stamp PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Stamp PDF" description="Add an image stamp (logo, badge) to every page of your PDF." accentColor="hsl(280, 55%, 50%)" icon={<Stamp className="h-5 w-5" />}>
      {!pdfFile ? (
        <FileDropZone onFiles={handlePdfFiles} accept=".pdf" label="Drop a PDF here" />
      ) : !stampFile ? (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{pdfFile.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(pdfFile.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setPdfFile(null)}>Change PDF</Button>
            </CardContent>
          </Card>
          <FileDropZone onFiles={handleStampFiles} accept=".png,.jpg,.jpeg" label="Now drop your stamp image" sublabel="PNG or JPG — logo, badge, signature" />
        </>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{pdfFile.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · Stamp: {stampFile.name}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => setPdfFile(null)}>Change PDF</Button>
                <Button variant="ghost" size="sm" onClick={() => { setStampFile(null); setStampUrl(""); }}>Change Stamp</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="font-semibold">Position</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-semibold">Size: {stampSize[0]}%</Label>
                <Slider value={stampSize} onValueChange={setStampSize} min={5} max={80} step={1} className="mt-2" />
              </div>
              <div>
                <Label className="font-semibold">Opacity: {opacity[0]}%</Label>
                <Slider value={opacity} onValueChange={setOpacity} min={10} max={100} step={5} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Label className="font-semibold text-sm mb-2">Live Preview (Page 1)</Label>
              <canvas ref={previewRef} className="rounded border max-w-full" />
            </CardContent>
          </Card>

          <Button onClick={handleStamp} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Stamping…" : "Stamp & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default StampPdfPage;
