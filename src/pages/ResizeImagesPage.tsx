import { useState, useCallback } from "react";
import { Scaling, Download } from "lucide-react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

const ResizeImagesPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [keepAspect, setKeepAspect] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [zip, setZip] = useState<Blob | null>(null);

  const handleFiles = useCallback((f: File[]) => { setFiles(f); setDone(false); setZip(null); }, []);

  const handleResize = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const jszip = new JSZip();
      for (const file of files) {
        const img = new Image();
        const url = URL.createObjectURL(file);
        await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = url; });
        
        let w = width, h = height;
        if (keepAspect) {
          const ratio = img.width / img.height;
          h = Math.round(w / ratio);
        }

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
      setDone(true);
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
          <Card><CardContent className="p-6">
            <p className="font-semibold">{files.length} image(s) selected</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFiles([]); setDone(false); }}>Choose different files</Button>
          </CardContent></Card>
          <Card><CardContent className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Width (px)</Label><Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} /></div>
              <div><Label className="text-xs">Height (px)</Label><Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} disabled={keepAspect} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} /> Maintain aspect ratio
            </label>
          </CardContent></Card>
          <div className="flex gap-3">
            <Button onClick={handleResize} disabled={processing} className="flex-1" size="lg">{processing ? "Resizing…" : "Resize Images"}</Button>
            {done && zip && <Button onClick={() => saveAs(zip, "resized-images.zip")} size="lg" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Download ZIP</Button>}
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default ResizeImagesPage;
