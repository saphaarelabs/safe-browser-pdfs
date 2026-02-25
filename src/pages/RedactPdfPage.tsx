import { useState, useRef, useEffect, useCallback } from "react";
import { EyeOff, Undo2, ChevronLeft, ChevronRight } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Rect { x: number; y: number; w: number; h: number; }

const RedactPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [rectsPerPage, setRectsPerPage] = useState<Record<number, Rect[]>>({});
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageImg, setPageImg] = useState<ImageData | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!file) return;
    (async () => {
      const bytes = await file.arrayBuffer();
      setFileBytes(bytes);
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      setPdfDoc(pdf);
      setPageCount(pdf.numPages);
      setCurrentPage(0);
      setRectsPerPage({});
    })();
  }, [file]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc) return;
    (async () => {
      const page = await pdfDoc.getPage(currentPage + 1);
      const vp = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current!;
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      setPageImg(ctx.getImageData(0, 0, vp.width, vp.height));
    })();
  }, [pdfDoc, currentPage]);

  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !pageImg) return;
    ctx.putImageData(pageImg, 0, 0);
    ctx.fillStyle = "black";
    (rectsPerPage[currentPage] || []).forEach((r) => ctx.fillRect(r.x, r.y, r.w, r.h));
  }, [pageImg, rectsPerPage, currentPage]);

  useEffect(() => { redraw(); }, [redraw]);

  const getPos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const sx = canvasRef.current!.width / rect.width;
    const sy = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setStart(getPos(e));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!start) return;
    const end = getPos(e);
    const nr: Rect = { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), w: Math.abs(end.x - start.x), h: Math.abs(end.y - start.y) };
    if (nr.w > 5 && nr.h > 5) {
      setRectsPerPage((prev) => ({ ...prev, [currentPage]: [...(prev[currentPage] || []), nr] }));
    }
    setStart(null);
  };

  const undo = () => {
    setRectsPerPage((prev) => {
      const arr = [...(prev[currentPage] || [])];
      arr.pop();
      return { ...prev, [currentPage]: arr };
    });
  };

  const totalRects = Object.values(rectsPerPage).reduce((sum, arr) => sum + arr.length, 0);

  const handleSave = async () => {
    if (!fileBytes || totalRects === 0) return;
    setProcessing(true);
    try {
      const src = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const doc = await PDFDocument.create();

      for (let i = 0; i < pageCount; i++) {
        const rects = rectsPerPage[i];
        if (rects && rects.length > 0) {
          // Render with redactions
          const page = await pdfDoc!.getPage(i + 1);
          const vp = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width; canvas.height = vp.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
          ctx.fillStyle = "black";
          rects.forEach((r) => ctx.fillRect(r.x, r.y, r.w, r.h));
          const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
          const imgBytes = await blob.arrayBuffer();
          const img = await doc.embedPng(new Uint8Array(imgBytes));
          const srcPage = src.getPage(i);
          const { width, height } = srcPage.getSize();
          const p = doc.addPage([width, height]);
          p.drawImage(img, { x: 0, y: 0, width, height });
        } else {
          const [cp] = await doc.copyPages(src, [i]);
          doc.addPage(cp);
        }
      }

      const out = await doc.save();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" }));
      a.download = file!.name.replace(".pdf", "-redacted.pdf");
      a.click();
      toast.success("PDF redacted!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to redact PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Redact PDF" description="Draw black rectangles on any page to redact sensitive content." accentColor="hsl(0, 0%, 20%)" icon={<EyeOff className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <div className="space-y-4">
          {/* Page nav */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px]" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[80px] text-center">Page {currentPage + 1} / {pageCount}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px]" onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))} disabled={currentPage >= pageCount - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">{totalRects} redaction(s) total</span>
          </div>

          <p className="text-xs text-muted-foreground">Draw rectangles on the page to redact areas. Navigate between pages above.</p>
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            className="max-w-full cursor-crosshair rounded border touch-none"
            style={{ width: "100%" }}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={processing || totalRects === 0} className="min-h-[44px]">
              {processing ? "Saving…" : `Redact & Download`}
            </Button>
            <Button variant="outline" onClick={undo} disabled={!(rectsPerPage[currentPage]?.length)} className="gap-1.5 min-h-[44px]">
              <Undo2 className="h-3.5 w-3.5" /> Undo
            </Button>
            <Button variant="outline" onClick={() => setRectsPerPage({})} className="min-h-[44px]">Clear All</Button>
            <Button variant="outline" onClick={() => { setFile(null); setRectsPerPage({}); setPageImg(null); }} className="min-h-[44px]">New File</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default RedactPdfPage;
