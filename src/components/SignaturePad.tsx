import { useState, useRef, useEffect, useCallback } from "react";
import { Pen, Type, Upload, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type Mode = "draw" | "type" | "upload";

interface SignaturePadProps {
  onSignature: (dataUrl: string) => void;
  className?: string;
}

const COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Blue", value: "#1a3a8a" },
  { label: "Red", value: "#991b1b" },
];

const FONTS = [
  "'Brush Script MT', cursive",
  "'Georgia', serif",
  "'Courier New', monospace",
];

const SignaturePad = ({ onSignature, className }: SignaturePadProps) => {
  const [mode, setMode] = useState<Mode>("draw");
  const [color, setColor] = useState("#000000");
  const [thickness, setThickness] = useState(3);
  const [text, setText] = useState("");
  const [fontIdx, setFontIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Emit signature
  const emitSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Check if canvas is blank
    const ctx = canvas.getContext("2d")!;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const hasContent = data.some((v, i) => i % 4 === 3 && v > 0);
    if (hasContent) {
      // Crop to content
      let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const a = data[(y * canvas.width + x) * 4 + 3];
          if (a > 0) {
            minX = Math.min(minX, x); minY = Math.min(minY, y);
            maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
          }
        }
      }
      const pad = 10;
      minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
      maxX = Math.min(canvas.width, maxX + pad); maxY = Math.min(canvas.height, maxY + pad);
      const cropped = document.createElement("canvas");
      cropped.width = maxX - minX; cropped.height = maxY - minY;
      cropped.getContext("2d")!.drawImage(canvas, minX, minY, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
      onSignature(cropped.toDataURL("image/png"));
    }
  }, [onSignature]);

  // Drawing handlers using pointer events
  const getPos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (mode !== "draw") return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDrawing.current = true;
    lastPoint.current = getPos(e);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !lastPoint.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPoint.current = pos;
  };

  const onPointerUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      lastPoint.current = null;
      emitSignature();
    }
  };

  // Type mode: render text to canvas on change
  useEffect(() => {
    if (mode !== "type" || !text.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = `48px ${FONTS[fontIdx]}`;
    ctx.textBaseline = "middle";
    const tm = ctx.measureText(text);
    ctx.fillText(text, (canvas.width - tm.width) / 2, canvas.height / 2);
    onSignature(canvas.toDataURL("image/png"));
  }, [text, fontIdx, color, mode, onSignature]);

  // Upload mode
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
        const w = img.width * scale, h = img.height * scale;
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
        onSignature(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Mode tabs */}
      <div className="flex gap-1 rounded-lg bg-secondary p-1">
        {([
          { m: "draw" as Mode, icon: Pen, label: "Draw" },
          { m: "type" as Mode, icon: Type, label: "Type" },
          { m: "upload" as Mode, icon: Upload, label: "Upload" },
        ]).map(({ m, icon: Icon, label }) => (
          <button
            key={m}
            onClick={() => { setMode(m); clearCanvas(); }}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors min-h-[44px]",
              mode === m ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg border-2 border-dashed border-border bg-card">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={cn(
            "w-full rounded-lg touch-none",
            mode === "draw" ? "cursor-crosshair" : "cursor-default"
          )}
          style={{ height: 150 }}
        />
        {mode === "draw" && (
          <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground pointer-events-none">
            Draw your signature here
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Color picker */}
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center",
                color === c.value ? "border-foreground scale-110" : "border-border"
              )}
              title={c.label}
            >
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: c.value }} />
            </button>
          ))}
        </div>

        {mode === "draw" && (
          <div className="flex items-center gap-2 flex-1 min-w-[120px]">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Thickness</span>
            <Slider value={[thickness]} onValueChange={(v) => setThickness(v[0])} min={1} max={8} step={1} className="flex-1" />
          </div>
        )}

        {mode === "type" && (
          <div className="flex gap-1">
            {FONTS.map((f, i) => (
              <button
                key={f}
                onClick={() => setFontIdx(i)}
                className={cn(
                  "px-2.5 py-1 text-sm rounded border min-h-[44px]",
                  fontIdx === i ? "border-primary bg-primary/10" : "border-border"
                )}
                style={{ fontFamily: f }}
              >
                Aa
              </button>
            ))}
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={clearCanvas} className="ml-auto gap-1.5 min-h-[44px]">
          <Eraser className="h-3.5 w-3.5" /> Clear
        </Button>
      </div>

      {/* Type input */}
      {mode === "type" && (
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your signature…"
          className="text-lg min-h-[44px]"
          style={{ fontFamily: FONTS[fontIdx] }}
        />
      )}

      {/* Upload input */}
      {mode === "upload" && (
        <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground hover:bg-secondary/50 transition-colors min-h-[44px]">
          Click to upload a signature image (PNG, JPG)
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      )}
    </div>
  );
};

export default SignaturePad;
