import { useState, useCallback, useEffect } from "react";
import { Scaling, Download } from "lucide-react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

const ResizeImagesPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [keepAspect, setKeepAspect] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [zip, setZip] = useState<Blob | null>(null);

  const handleFiles = useCallback((f: File[]) => {
    setFiles(f);
    setZip(null);
    // Show preview of first image
    if (f.length > 0) {
      const url = URL.createObjectURL(f[0]);
      setPreview(url);
      const img = new Image();
      img.onload = () => {
        setOrigDims({ w: img.naturalWidth, h: img.naturalHeight });
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      };
      img.src = url;
    }
  }, []);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const computedHeight = keepAspect && origDims ? Math.round(width * (origDims.h / origDims.w)) : height;

  const handleResize = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const jszip = new JSZip();
      for (const file of files) {
        const img = new Image();
        const url = URL.createObjectURL(file);
        await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = url; });
        const w = width;
        const h = keepAspect ? Math.round(w * (img.height / img.width)) : height;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
        jszip.file(`resized-${file.name.replace(/\.[^.]+$/, ".png")}`, blob);
      }
      const zipBlob = await jszip.generateAsync({ type: "blob" });
      setZip(zipBlob);
      toast.success(`Resized ${files.length} image(s)!`);
    } catch {
      toast.error("Failed to resize images.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Resize Images" description="Resize images to specific dimensions" accentColor="hsl(180, 50%, 40%)" icon={<Scaling className="h-5 w-5" />}>
      {files.length === 0 ? (
        <FileDropZone onFiles={handleFiles} accept=".jpg,.jpeg,.png,.webp,.bmp" multiple label="Drop images to resize" sublabel="JPG, PNG, WebP supported" />
      ) : (
        <>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{files.length} image(s) selected</p>
                {origDims && <p className="text-xs text-muted-foreground">First image: {origDims.w} × {origDims.h}px</p>}
              </div>
              <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => { setFiles([]); setZip(null); setPreview(null); setOrigDims(null); }}>Change</Button>
            </CardContent>
          </Card>

          {preview && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Original</p>
                <div className="rounded-lg border bg-muted/30 p-2 flex items-center justify-center" style={{ maxHeight: "200px" }}>
                  <img src={preview} alt="Original" className="max-w-full max-h-[180px] object-contain rounded" />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Output: {width} × {computedHeight}px</p>
                <div className="rounded-lg border bg-muted/30 p-2 flex items-center justify-center" style={{ maxHeight: "200px" }}>
                  <img src={preview} alt="Resized preview" className="object-contain rounded" style={{ width: Math.min(width, 280), height: "auto" }} />
                </div>
              </div>
            </div>
          )}

          <Card><CardContent className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Width (px)</Label><Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} /></div>
              <div><Label className="text-xs">Height (px)</Label><Input type="number" value={keepAspect ? computedHeight : height} onChange={(e) => setHeight(Number(e.target.value))} disabled={keepAspect} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="aspect" checked={keepAspect} onCheckedChange={(v) => setKeepAspect(!!v)} />
              <Label htmlFor="aspect" className="text-sm">Maintain aspect ratio</Label>
            </div>
          </CardContent></Card>

          <div className="flex gap-3">
            <Button onClick={handleResize} disabled={processing} className="flex-1 min-h-[44px]" size="lg">{processing ? "Resizing…" : "Resize Images"}</Button>
            {zip && <Button onClick={() => saveAs(zip, "resized-images.zip")} size="lg" variant="outline" className="gap-2 min-h-[44px]"><Download className="h-4 w-4" /> Download ZIP</Button>}
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default ResizeImagesPage;
