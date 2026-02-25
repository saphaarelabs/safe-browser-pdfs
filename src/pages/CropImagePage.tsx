import { useState, useRef, useEffect, useCallback } from "react";
import { Crop } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

const CropImagePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cx: 0, cy: 0, cw: 0, ch: 0 });
  const [processing, setProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setDims({ w: img.naturalWidth, h: img.naturalHeight });
      setCrop({ x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight });
    };
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Convert page coords to image coords
  const toImageCoords = useCallback((clientX: number, clientY: number) => {
    if (!imgRef.current) return { x: 0, y: 0 };
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = dims.w / rect.width;
    const scaleY = dims.h / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }, [dims]);

  const onPointerDown = useCallback((e: React.PointerEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pos = toImageCoords(e.clientX, e.clientY);
    setDragging(handle);
    setDragStart({ x: pos.x, y: pos.y, cx: crop.x, cy: crop.y, cw: crop.w, ch: crop.h });
  }, [crop, toImageCoords]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const pos = toImageCoords(e.clientX, e.clientY);
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;

    setCrop((prev) => {
      let { x, y, w, h } = { x: dragStart.cx, y: dragStart.cy, w: dragStart.cw, h: dragStart.ch };
      if (dragging === "move") {
        x = Math.max(0, Math.min(dims.w - w, x + dx));
        y = Math.max(0, Math.min(dims.h - h, y + dy));
      } else if (dragging === "tl") {
        x += dx; y += dy; w -= dx; h -= dy;
      } else if (dragging === "tr") {
        y += dy; w += dx; h -= dy;
      } else if (dragging === "bl") {
        x += dx; w -= dx; h += dy;
      } else if (dragging === "br") {
        w += dx; h += dy;
      }
      // Clamp
      w = Math.max(20, w); h = Math.max(20, h);
      x = Math.max(0, Math.min(dims.w - 20, x));
      y = Math.max(0, Math.min(dims.h - 20, y));
      if (x + w > dims.w) w = dims.w - x;
      if (y + h > dims.h) h = dims.h - y;
      return { x, y, w, h };
    });
  }, [dragging, dragStart, dims, toImageCoords]);

  const onPointerUp = useCallback(() => { setDragging(null); }, []);

  const handleCrop = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = new Image();
      img.src = imgUrl;
      await new Promise((r) => (img.onload = r));
      const canvas = document.createElement("canvas");
      canvas.width = crop.w; canvas.height = crop.h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name.replace(/\.[^.]+$/, "-cropped.png");
        a.click();
      }, "image/png");
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  // Calculate overlay percentages for the crop rectangle
  const pctStyle = dims.w > 0 ? {
    left: `${(crop.x / dims.w) * 100}%`,
    top: `${(crop.y / dims.h) * 100}%`,
    width: `${(crop.w / dims.w) * 100}%`,
    height: `${(crop.h / dims.h) * 100}%`,
  } : {};

  const Handle = ({ pos, cursor }: { pos: string; cursor: string }) => (
    <div
      onPointerDown={(e) => onPointerDown(e, pos)}
      className={`absolute h-4 w-4 rounded-full bg-primary border-2 border-background shadow-md z-10 touch-none ${cursor}`}
      style={{
        ...(pos.includes("t") ? { top: -8 } : { bottom: -8 }),
        ...(pos.includes("l") ? { left: -8 } : { right: -8 }),
      }}
    />
  );

  return (
    <ToolPageLayout title="Crop Image" description="Drag the handles to crop your image visually." accentColor="hsl(15, 70%, 50%)" icon={<Crop className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".png,.jpg,.jpeg,.webp,.bmp,.gif" label="Drop an image here" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Original: {dims.w} × {dims.h}px · Crop: {Math.round(crop.w)} × {Math.round(crop.h)}px</p>
            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setImgUrl(""); }} className="min-h-[44px]">Clear</Button>
          </div>

          {/* Interactive crop area */}
          <div
            ref={containerRef}
            className="relative select-none overflow-hidden rounded-lg border bg-muted/30"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <img ref={imgRef} src={imgUrl} alt="Preview" className="block w-full h-auto" />

            {/* Dimming overlay (4 rectangles around crop) */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top dim */}
              <div className="absolute bg-black/40" style={{ top: 0, left: 0, right: 0, height: pctStyle.top }} />
              {/* Bottom dim */}
              <div className="absolute bg-black/40" style={{ bottom: 0, left: 0, right: 0, top: `calc(${pctStyle.top} + ${pctStyle.height})` }} />
              {/* Left dim */}
              <div className="absolute bg-black/40" style={{ top: pctStyle.top, left: 0, width: pctStyle.left, height: pctStyle.height }} />
              {/* Right dim */}
              <div className="absolute bg-black/40" style={{ top: pctStyle.top, right: 0, left: `calc(${pctStyle.left} + ${pctStyle.width})`, height: pctStyle.height }} />
            </div>

            {/* Crop selection rectangle */}
            <div
              className="absolute border-2 border-primary/80 touch-none cursor-move"
              style={pctStyle}
              onPointerDown={(e) => onPointerDown(e, "move")}
            >
              <Handle pos="tl" cursor="cursor-nw-resize" />
              <Handle pos="tr" cursor="cursor-ne-resize" />
              <Handle pos="bl" cursor="cursor-sw-resize" />
              <Handle pos="br" cursor="cursor-se-resize" />
            </div>
          </div>

          <Button onClick={handleCrop} disabled={processing} className="w-full min-h-[44px]">
            {processing ? "Cropping…" : "Crop & Download"}
          </Button>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default CropImagePage;
