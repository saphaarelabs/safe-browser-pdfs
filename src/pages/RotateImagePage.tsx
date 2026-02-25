import { useState } from "react";
import { RotateCw } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

const RotateImagePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [preview, setPreview] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  const loadPreview = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

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
      }, file.type || "image/png");
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Rotate Image" description="Rotate images by 90°, 180°, or 270°." accentColor="hsl(340, 65%, 55%)" icon={<RotateCw className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => loadPreview(f[0])} accept=".png,.jpg,.jpeg,.webp,.bmp,.gif" label="Drop an image here" />
      ) : (
        <div className="space-y-4">
          {preview && <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-md border" style={{ transform: `rotate(${angle}deg)` }} />}
          <div className="flex items-center gap-2 justify-center">
            {[90, 180, 270].map((a) => (
              <Button key={a} variant={angle === a ? "default" : "outline"} size="sm" onClick={() => setAngle(a)}>{a}°</Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRotate} disabled={processing}>{processing ? "Rotating…" : "Rotate & Download"}</Button>
            <Button variant="outline" onClick={() => { setFile(null); setPreview(""); }}>Clear</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default RotateImagePage;
