import { useState, useRef, useEffect } from "react";
import { Crop } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CropImagePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [processing, setProcessing] = useState(false);

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

  const handleCrop = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = new Image();
      img.src = imgUrl;
      await new Promise((r) => (img.onload = r));
      const canvas = document.createElement("canvas");
      canvas.width = crop.w;
      canvas.height = crop.h;
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

  return (
    <ToolPageLayout title="Crop Image" description="Crop an image by specifying coordinates and dimensions." accentColor="hsl(15, 70%, 50%)" icon={<Crop className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".png,.jpg,.jpeg,.webp,.bmp,.gif" label="Drop an image here" />
      ) : (
        <div className="space-y-4">
          {imgUrl && <img src={imgUrl} alt="Preview" className="max-h-48 rounded border object-contain" />}
          <p className="text-xs text-muted-foreground">Original: {dims.w} × {dims.h}px</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium">X</label><Input type="number" value={crop.x} onChange={(e) => setCrop({ ...crop, x: +e.target.value })} /></div>
            <div><label className="text-xs font-medium">Y</label><Input type="number" value={crop.y} onChange={(e) => setCrop({ ...crop, y: +e.target.value })} /></div>
            <div><label className="text-xs font-medium">Width</label><Input type="number" value={crop.w} onChange={(e) => setCrop({ ...crop, w: +e.target.value })} /></div>
            <div><label className="text-xs font-medium">Height</label><Input type="number" value={crop.h} onChange={(e) => setCrop({ ...crop, h: +e.target.value })} /></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCrop} disabled={processing}>{processing ? "Cropping…" : "Crop & Download"}</Button>
            <Button variant="outline" onClick={() => { setFile(null); setImgUrl(""); }}>Clear</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default CropImagePage;
