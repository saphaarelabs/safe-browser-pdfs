import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { cn } from "@/lib/utils";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfPageThumbnailProps {
  fileBytes: ArrayBuffer;
  pageIndex: number;
  width?: number;
  className?: string;
  selected?: boolean;
  selectionColor?: "primary" | "destructive";
  onClick?: () => void;
  label?: string;
}

const PdfPageThumbnail = ({
  fileBytes,
  pageIndex,
  width = 120,
  className,
  selected,
  selectionColor = "primary",
  onClick,
  label,
}: PdfPageThumbnailProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: fileBytes.slice(0) }).promise;
        if (cancelled) return;
        const page = await pdf.getPage(pageIndex + 1);
        if (cancelled) return;
        const vp = page.getViewport({ scale: 1 });
        const scale = width / vp.width;
        const scaledVp = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = scaledVp.width;
        canvas.height = scaledVp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: scaledVp }).promise;
        if (!cancelled) setLoaded(true);
      } catch {
        // silently fail for invalid pages
      }
    })();
    return () => { cancelled = true; };
  }, [fileBytes, pageIndex, width]);

  const borderClass = selected
    ? selectionColor === "destructive"
      ? "ring-2 ring-destructive border-destructive"
      : "ring-2 ring-primary border-primary"
    : "border-border hover:border-foreground/30";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center gap-1.5 rounded-lg border bg-card p-1.5 transition-all min-h-[44px]",
        borderClass,
        onClick && "cursor-pointer",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className={cn("rounded transition-opacity", loaded ? "opacity-100" : "opacity-0")}
        style={{ width, height: "auto" }}
      />
      {!loaded && (
        <div className="flex items-center justify-center bg-muted rounded" style={{ width, height: width * 1.4 }}>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
      {label && (
        <span className={cn(
          "text-xs font-medium",
          selected
            ? selectionColor === "destructive" ? "text-destructive" : "text-primary"
            : "text-muted-foreground"
        )}>
          {label}
        </span>
      )}
    </button>
  );
};

export default PdfPageThumbnail;
