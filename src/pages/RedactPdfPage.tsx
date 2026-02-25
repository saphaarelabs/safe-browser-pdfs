import { useState, useRef, useEffect } from "react";
import { EyeOff } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Rect { x: number; y: number; w: number; h: number; page: number; }

const RedactPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [rects, setRects] = useState<Rect[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageImg, setPageImg] = useState<ImageData | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0, scale: 1 });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!file) return;
    (async () => {
      const bytes = await file.arrayBuffer();
      setFileBytes(bytes);
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const page = await pdf.getPage(1);
      const vp = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current!;
      canvas.width = vp.width;
      canvas.height = vp.height;
      setDims({ w: vp.width, h: vp.height, scale: 1.5 });
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      setPageImg(ctx.getImageData(0, 0, vp.width, vp.height));
    })();
  }, [file]);

  const redraw = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !pageImg) return;
    ctx.putImageData(pageImg, 0, 0);
    ctx.fillStyle = "black";
    rects.forEach((r) => ctx.fillRect(r.x, r.y, r.w, r.h));
  };

  useEffect(() => { redraw(); }, [rects, pageImg]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    setStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDrawing(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawing || !start) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const ex = e.clientX - rect.left;
    const ey = e.clientY - rect.top;
    const nr: Rect = { x: Math.min(start.x, ex), y: Math.min(start.y, ey), w: Math.abs(ex - start.x), h: Math.abs(ey - start.y), page: 0 };
    if (nr.w > 5 && nr.h > 5) setRects([...rects, nr]);
    setDrawing(false);
    setStart(null);
  };

  const handleSave = async () => {
    if (!fileBytes || rects.length === 0) return;
    setProcessing(true);
    try {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      if (pageImg) ctx.putImageData(pageImg, 0, 0);
      ctx.fillStyle = "black";
      rects.forEach((r) => ctx.fillRect(r.x, r.y, r.w, r.h));
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
      const imgBytes = await blob.arrayBuffer();
      const doc = await PDFDocument.create();
      const img = await doc.embedPng(imgBytes);
      const src = await PDFDocument.load(fileBytes);
      const srcPage = src.getPage(0);
      const { width, height } = srcPage.getSize();
      const page = doc.addPage([width, height]);
      page.drawImage(img, { x: 0, y: 0, width, height });
      // Copy remaining pages as-is
      for (let i = 1; i < src.getPageCount(); i++) {
        const [cp] = await doc.copyPages(src, [i]);
        doc.addPage(cp);
      }
      const out = await doc.save();
      const outBlob = new Blob([out as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(outBlob);
      a.download = file!.name.replace(".pdf", "-redacted.pdf");
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Redact PDF" description="Draw black rectangles to redact sensitive content." accentColor="hsl(0, 0%, 20%)" icon={<EyeOff className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Draw rectangles on the page to redact areas. Only page 1 is shown for drawing; other pages are preserved.</p>
          <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} className="max-w-full cursor-crosshair rounded border" style={{ width: "100%" }} />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={processing || rects.length === 0}>{processing ? "Saving…" : `Redact (${rects.length} areas)`}</Button>
            <Button variant="outline" onClick={() => setRects([])}>Clear Redactions</Button>
            <Button variant="outline" onClick={() => { setFile(null); setRects([]); setPageImg(null); }}>New File</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default RedactPdfPage;
