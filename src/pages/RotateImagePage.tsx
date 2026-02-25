import { useState, useRef, useEffect } from "react";
import { RotateCw, Download } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const RotateImagePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
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
      const rad = (angle * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const w = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
      const h = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);
      const canvas = canvasRef.current!;
      const maxW = 400;
      const scale = Math.min(maxW / w, maxW / h, 1);
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -(img.naturalWidth * scale) / 2, -(img.naturalHeight * scale) / 2, img.naturalWidth * scale, img.naturalHeight * scale);
    };
  }, [preview, angle]);

  const handleRotate = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      await new Promise((r) => (img.onload = r));
      const rad = (angle * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const w = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
      const h = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.translate(w / 2, h / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        const ext = file.name.match(/\.[^.]+$/)?.[0] || ".png";
        a.download = file.name.replace(ext, `-rotated${ext}`);
        a.click();
        toast.success("Image rotated!");
      }, file.type || "image/png");
    } catch (e) {
      console.error(e);
      toast.error("Failed to rotate image.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Rotate Image" description="Rotate images by 90°, 180°, or 270°." accentColor="hsl(340, 65%, 55%)" icon={<RotateCw className="h-5 w-5" />}>
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
                {[90, 180, 270].map((a) => (
                  <Button key={a} variant={angle === a ? "default" : "outline"} size="sm" className="min-h-[44px]" onClick={() => setAngle(a)}>{a}°</Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleRotate} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Rotating…" : "Rotate & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default RotateImagePage;
