import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as pdfjsLib from "pdfjs-dist";
import { cn } from "@/lib/utils";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  fileBytes: ArrayBuffer;
  className?: string;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  overlay?: React.ReactNode;
  onCanvasClick?: (x: number, y: number, pageWidth: number, pageHeight: number) => void;
}

const PdfViewer = ({
  fileBytes,
  className,
  currentPage = 0,
  onPageChange,
  overlay,
  onCanvasClick,
}: PdfViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(currentPage);
  const [zoom, setZoom] = useState(1.5);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const doc = await pdfjsLib.getDocument({ data: fileBytes.slice(0) }).promise;
      if (cancelled) return;
      setPdfDoc(doc);
      setPageCount(doc.numPages);
    })();
    return () => { cancelled = true; };
  }, [fileBytes]);

  useEffect(() => { setPage(currentPage); }, [currentPage]);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    const p = await pdfDoc.getPage(page + 1);
    const vp = p.getViewport({ scale: zoom });
    const canvas = canvasRef.current;
    canvas.width = vp.width;
    canvas.height = vp.height;
    setDims({ w: vp.width, h: vp.height });
    const ctx = canvas.getContext("2d")!;
    await p.render({ canvasContext: ctx, viewport: vp }).promise;
  }, [pdfDoc, page, zoom]);

  useEffect(() => { renderPage(); }, [renderPage]);

  const goPage = (n: number) => {
    const np = Math.max(0, Math.min(pageCount - 1, n));
    setPage(np);
    onPageChange?.(np);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCanvasClick || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    onCanvasClick(x, y, dims.w, dims.h);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary/50 px-3 py-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px]" onClick={() => goPage(page - 1)} disabled={page === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[80px] text-center">
            Page {page + 1} / {pageCount}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px]" onClick={() => goPage(page + 1)} disabled={page >= pageCount - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px]" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px]" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas with overlay */}
      <div className="relative overflow-auto rounded-lg border bg-muted/30" style={{ maxHeight: "60vh" }}>
        <canvas
          ref={canvasRef}
          className={cn("mx-auto block", onCanvasClick && "cursor-crosshair")}
          style={{ width: "100%", maxWidth: dims.w }}
          onClick={handleClick}
        />
        {overlay}
      </div>
    </div>
  );
};

export default PdfViewer;
