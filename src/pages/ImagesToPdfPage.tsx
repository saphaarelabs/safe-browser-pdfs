import { useState, useCallback } from "react";
import { ImagePlus, Download, X } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

interface ImageFile { file: File; id: string; url: string; }

const pageSizes: Record<string, [number, number]> = {
  "fit": [0, 0],
  "a4": [595.28, 841.89],
  "letter": [612, 792],
  "a3": [841.89, 1190.55],
};

const ImagesToPdfPage = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [pageSize, setPageSize] = useState("fit");
  const [margin, setMargin] = useState("0");

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

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const arr = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= arr.length) return arr;
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) { toast.error("Add at least one image."); return; }
    setProcessing(true);
    try {
      const pdf = await PDFDocument.create();
      const m = Math.max(0, parseInt(margin) || 0);

      for (const img of images) {
        const buffer = await img.file.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        const embeddedImage = img.file.type === "image/png"
          ? await pdf.embedPng(uint8) : await pdf.embedJpg(uint8);

        let pw: number, ph: number;
        if (pageSize === "fit") {
          pw = embeddedImage.width + m * 2;
          ph = embeddedImage.height + m * 2;
        } else {
          [pw, ph] = pageSizes[pageSize];
        }

        const page = pdf.addPage([pw, ph]);
        const drawW = pw - m * 2;
        const drawH = ph - m * 2;
        const scale = Math.min(drawW / embeddedImage.width, drawH / embeddedImage.height, 1);
        const iw = embeddedImage.width * scale;
        const ih = embeddedImage.height * scale;
        page.drawImage(embeddedImage, {
          x: m + (drawW - iw) / 2,
          y: m + (drawH - ih) / 2,
          width: iw,
          height: ih,
        });
      }

      const bytes = await pdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), "images.pdf");
      toast.success("PDF created from images!");
    } catch (err) {
      toast.error("Failed to create PDF. Make sure images are JPG or PNG.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Images to PDF" description="Convert images into a PDF document" accentColor="hsl(45, 93%, 47%)" icon={<ImagePlus className="h-5 w-5" />}>
      <FileDropZone onFiles={handleFiles} accept=".jpg,.jpeg,.png" multiple label="Drop images here" sublabel="JPG or PNG — add multiple files" />

      {images.length > 0 && (
        <>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Page Size</Label>
                  <Select value={pageSize} onValueChange={setPageSize}>
                    <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fit">Fit to Image</SelectItem>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="a3">A3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-semibold">Margin (pt)</Label>
                  <Input type="number" min={0} max={100} value={margin} onChange={(e) => setMargin(e.target.value)} className="mt-1 min-h-[44px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="divide-y p-0">
              {images.map((img, i) => (
                <div key={img.id} className="flex items-center gap-3 px-4 py-3">
                  <img src={img.url} alt="" className="h-10 w-10 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{img.file.name}</p>
                    <p className="text-xs text-muted-foreground">{(img.file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-xs" onClick={() => moveImage(i, -1)} disabled={i === 0}>↑</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-xs" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}>↓</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeImage(img.id)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button onClick={handleConvert} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Creating PDF…" : `Create PDF from ${images.length} Image${images.length > 1 ? "s" : ""}`}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default ImagesToPdfPage;
