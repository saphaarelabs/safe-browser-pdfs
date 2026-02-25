import { useState, useCallback, useRef, useEffect } from "react";
import { ImagePlus, Download, X } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ImageFile { file: File; id: string; url: string; }

const MergeImagesPage = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [direction, setDirection] = useState<"horizontal" | "vertical">("vertical");
  const [gap, setGap] = useState("0");
  const [processing, setProcessing] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, id: crypto.randomUUID(), url: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...imageFiles]);
  }, []);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    setImages((prev) => {
      const arr = [...prev];
      const newIdx = index + dir;
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
      return arr;
    });
  };

  // Preview
  useEffect(() => {
    if (images.length === 0 || !previewRef.current) return;
    const loadAll = async () => {
      const loaded: HTMLImageElement[] = [];
      for (const img of images) {
        const el = new window.Image();
        el.src = img.url;
        await new Promise((r) => (el.onload = r));
        loaded.push(el);
      }
      const g = Math.max(0, parseInt(gap) || 0);
      const canvas = previewRef.current!;
      const maxPreview = 400;

      if (direction === "vertical") {
        const maxW = Math.max(...loaded.map((i) => i.naturalWidth));
        const totalH = loaded.reduce((s, i) => s + i.naturalHeight, 0) + g * (loaded.length - 1);
        const scale = Math.min(maxPreview / maxW, maxPreview / totalH, 1);
        canvas.width = maxW * scale;
        canvas.height = totalH * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let y = 0;
        for (const img of loaded) {
          const w = img.naturalWidth * scale;
          const h = img.naturalHeight * scale;
          ctx.drawImage(img, (canvas.width - w) / 2, y, w, h);
          y += h + g * scale;
        }
      } else {
        const maxH = Math.max(...loaded.map((i) => i.naturalHeight));
        const totalW = loaded.reduce((s, i) => s + i.naturalWidth, 0) + g * (loaded.length - 1);
        const scale = Math.min(maxPreview / totalW, maxPreview / maxH, 1);
        canvas.width = totalW * scale;
        canvas.height = maxH * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let x = 0;
        for (const img of loaded) {
          const w = img.naturalWidth * scale;
          const h = img.naturalHeight * scale;
          ctx.drawImage(img, x, (canvas.height - h) / 2, w, h);
          x += w + g * scale;
        }
      }
    };
    loadAll();
  }, [images, direction, gap]);

  const handleMerge = async () => {
    if (images.length < 2) { toast.error("Add at least 2 images."); return; }
    setProcessing(true);
    try {
      const loaded: HTMLImageElement[] = [];
      for (const img of images) {
        const el = new window.Image();
        el.src = img.url;
        await new Promise((r) => (el.onload = r));
        loaded.push(el);
      }
      const g = Math.max(0, parseInt(gap) || 0);
      const canvas = document.createElement("canvas");

      if (direction === "vertical") {
        canvas.width = Math.max(...loaded.map((i) => i.naturalWidth));
        canvas.height = loaded.reduce((s, i) => s + i.naturalHeight, 0) + g * (loaded.length - 1);
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let y = 0;
        for (const img of loaded) {
          ctx.drawImage(img, (canvas.width - img.naturalWidth) / 2, y);
          y += img.naturalHeight + g;
        }
      } else {
        canvas.width = loaded.reduce((s, i) => s + i.naturalWidth, 0) + g * (loaded.length - 1);
        canvas.height = Math.max(...loaded.map((i) => i.naturalHeight));
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let x = 0;
        for (const img of loaded) {
          ctx.drawImage(img, x, (canvas.height - img.naturalHeight) / 2);
          x += img.naturalWidth + g;
        }
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "merged-image.png";
        a.click();
        toast.success("Images merged!");
      }, "image/png");
    } catch (e) {
      console.error(e);
      toast.error("Failed to merge images.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Merge Images" description="Stitch multiple images together side-by-side or vertically." accentColor="hsl(160, 55%, 45%)" icon={<ImagePlus className="h-5 w-5" />}>
      <FileDropZone onFiles={handleFiles} accept=".png,.jpg,.jpeg,.webp" multiple label="Drop images here" sublabel="Add multiple images to merge" />

      {images.length > 0 && (
        <>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Direction</Label>
                  <Select value={direction} onValueChange={(v: "horizontal" | "vertical") => setDirection(v)}>
                    <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vertical">Vertical (↓)</SelectItem>
                      <SelectItem value="horizontal">Horizontal (→)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-semibold">Gap (px)</Label>
                  <Input type="number" min={0} max={100} value={gap} onChange={(e) => setGap(e.target.value)} className="mt-1 min-h-[44px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="divide-y p-0">
              {images.map((img, i) => (
                <div key={img.id} className="flex items-center gap-3 px-4 py-2.5">
                  <img src={img.url} alt="" className="h-10 w-10 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{img.file.name}</p>
                    <p className="text-xs text-muted-foreground">{(img.file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveImage(i, -1)} disabled={i === 0}>↑</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}>↓</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeImage(img.id)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Label className="font-semibold text-sm mb-2">Preview</Label>
              <canvas ref={previewRef} className="rounded border max-w-full" />
            </CardContent>
          </Card>

          <Button onClick={handleMerge} disabled={processing || images.length < 2} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Merging…" : `Merge ${images.length} Images`}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default MergeImagesPage;
