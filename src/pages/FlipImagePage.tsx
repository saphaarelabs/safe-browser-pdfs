import { useState } from "react";
import { FlipHorizontal } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

const FlipImagePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [direction, setDirection] = useState<"horizontal" | "vertical">("horizontal");
  const [preview, setPreview] = useState("");
  const [processing, setProcessing] = useState(false);

  const loadPreview = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

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
      }, file.type || "image/png");
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Flip Image" description="Flip images horizontally or vertically." accentColor="hsl(190, 60%, 50%)" icon={<FlipHorizontal className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => loadPreview(f[0])} accept=".png,.jpg,.jpeg,.webp,.bmp,.gif" label="Drop an image here" />
      ) : (
        <div className="space-y-4">
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-md border"
              style={{ transform: direction === "horizontal" ? "scaleX(-1)" : "scaleY(-1)" }}
            />
          )}
          <div className="flex items-center gap-2 justify-center">
            <Button variant={direction === "horizontal" ? "default" : "outline"} size="sm" onClick={() => setDirection("horizontal")}>Horizontal</Button>
            <Button variant={direction === "vertical" ? "default" : "outline"} size="sm" onClick={() => setDirection("vertical")}>Vertical</Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleFlip} disabled={processing}>{processing ? "Flipping…" : "Flip & Download"}</Button>
            <Button variant="outline" onClick={() => { setFile(null); setPreview(""); }}>Clear</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default FlipImagePage;
