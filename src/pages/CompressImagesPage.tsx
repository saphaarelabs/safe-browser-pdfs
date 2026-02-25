import { useState, useCallback } from "react";
import { ImageDown, Download } from "lucide-react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

const CompressImagesPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(70);
  const [processing, setProcessing] = useState(false);
  const [zip, setZip] = useState<Blob | null>(null);

  const handleFiles = useCallback((f: File[]) => { setFiles(f); setZip(null); }, []);

  const handleCompress = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const jszip = new JSZip();
      for (const file of files) {
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
      toast.success(`Compressed ${files.length} image(s)!`);
    } catch {
      toast.error("Failed to compress images.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Compress Images" description="Reduce image file size with quality control" accentColor="hsl(55, 70%, 45%)" icon={<ImageDown className="h-5 w-5" />}>
      {files.length === 0 ? (
        <FileDropZone onFiles={handleFiles} accept=".jpg,.jpeg,.png,.webp,.bmp" multiple label="Drop images to compress" sublabel="JPG, PNG, WebP supported" />
      ) : (
        <>
          <Card><CardContent className="p-6">
            <p className="font-semibold">{files.length} image(s) selected</p>
            <p className="text-sm text-muted-foreground">Total: {(files.reduce((s, f) => s + f.size, 0) / 1024).toFixed(0)} KB</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFiles([]); setZip(null); }}>Choose different files</Button>
          </CardContent></Card>
          <Card><CardContent className="p-6 space-y-3">
            <Label className="font-semibold">Quality: {quality}%</Label>
            <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={10} max={100} step={5} />
            <p className="text-xs text-muted-foreground">Lower quality = smaller file size. 70% is a good balance.</p>
          </CardContent></Card>
          <div className="flex gap-3">
            <Button onClick={handleCompress} disabled={processing} className="flex-1" size="lg">{processing ? "Compressing…" : "Compress Images"}</Button>
            {zip && <Button onClick={() => saveAs(zip, "compressed-images.zip")} size="lg" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Download ZIP</Button>}
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default CompressImagesPage;
