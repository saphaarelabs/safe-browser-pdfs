import { useState, useRef, useEffect } from "react";
import { FlipHorizontal, Download } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const FlipImagePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [direction, setDirection] = useState<"horizontal" | "vertical">("horizontal");
  const [preview, setPreview] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processing, setProcessing] = useState(false);

  const loadPreview = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // Live canvas preview
  useEffect(() => {
    if (!preview || !canvasRef.current) return;
    const img = new window.Image();
    img.src = preview;
    img.onload = () => {
      const canvas = canvasRef.current!;
      const maxW = 400;
      const scale = Math.min(maxW / img.naturalWidth, maxW / img.naturalHeight, 1);
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (direction === "horizontal") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [preview, direction]);

  const handleFlip = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      await new Promise((r) => (img.onload = r));
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (direction === "horizontal") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        const ext = file.name.match(/\.[^.]+$/)?.[0] || ".png";
        a.download = file.name.replace(ext, `-flipped${ext}`);
        a.click();
        toast.success("Image flipped!");
      }, file.type || "image/png");
    } catch (e) {
      console.error(e);
      toast.error("Failed to flip image.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Flip Image" description="Flip images horizontally or vertically." accentColor="hsl(190, 60%, 50%)" icon={<FlipHorizontal className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => loadPreview(f[0])} accept=".png,.jpg,.jpeg,.webp,.bmp,.gif" label="Drop an image here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setPreview(""); }}>Choose different file</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <canvas ref={canvasRef} className="rounded border max-w-full" />
              <div className="flex items-center gap-2">
                <Button variant={direction === "horizontal" ? "default" : "outline"} size="sm" className="min-h-[44px]" onClick={() => setDirection("horizontal")}>Horizontal</Button>
                <Button variant={direction === "vertical" ? "default" : "outline"} size="sm" className="min-h-[44px]" onClick={() => setDirection("vertical")}>Vertical</Button>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleFlip} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Flipping…" : "Flip & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default FlipImagePage;
