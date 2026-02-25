import { useState, useCallback, useEffect } from "react";
import { ImageDown, Download, X } from "lucide-react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

interface ImageFile {
  file: File;
  id: string;
  preview: string;
}

const CompressImagesPage = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(70);
  const [processing, setProcessing] = useState(false);
  const [zip, setZip] = useState<Blob | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    const newImages = files.map((f) => ({
      file: f,
      id: crypto.randomUUID(),
      preview: URL.createObjectURL(f),
    }));
    setImages((prev) => [...prev, ...newImages]);
    setZip(null);
  }, []);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  useEffect(() => {
    return () => images.forEach((i) => URL.revokeObjectURL(i.preview));
  }, []);

  const handleCompress = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    try {
      const jszip = new JSZip();
      for (const { file } of images) {
        const img = new Image();
        const url = URL.createObjectURL(file);
        await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = url; });
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", quality / 100));
        jszip.file(`compressed-${file.name.replace(/\.[^.]+$/, ".jpg")}`, blob);
      }
      const zipBlob = await jszip.generateAsync({ type: "blob" });
      setZip(zipBlob);
      toast.success(`Compressed ${images.length} image(s)!`);
    } catch {
      toast.error("Failed to compress images.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Compress Images" description="Reduce image file size with quality control" accentColor="hsl(55, 70%, 45%)" icon={<ImageDown className="h-5 w-5" />} wide>
      <FileDropZone onFiles={handleFiles} accept=".jpg,.jpeg,.png,.webp,.bmp" multiple label="Drop images to compress" sublabel="JPG, PNG, WebP supported" />

      {images.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group rounded-lg border bg-card overflow-hidden">
                <img src={img.preview} alt={img.file.name} className="w-full aspect-square object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-xs text-white truncate">{img.file.name}</p>
                  <p className="text-[10px] text-white/70">{(img.file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <Card><CardContent className="p-6 space-y-3">
            <Label className="font-semibold">Quality: {quality}%</Label>
            <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={10} max={100} step={5} />
            <p className="text-xs text-muted-foreground">Lower quality = smaller file size. 70% is a good balance.</p>
          </CardContent></Card>

          <div className="flex gap-3">
            <Button onClick={handleCompress} disabled={processing} className="flex-1 min-h-[44px]" size="lg">{processing ? "Compressing…" : `Compress ${images.length} Images`}</Button>
            {zip && <Button onClick={() => saveAs(zip, "compressed-images.zip")} size="lg" variant="outline" className="gap-2 min-h-[44px]"><Download className="h-4 w-4" /> Download ZIP</Button>}
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default CompressImagesPage;
