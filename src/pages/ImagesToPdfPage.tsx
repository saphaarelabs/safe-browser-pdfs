import { useState, useCallback } from "react";
import { ImagePlus, Download, X, FileText } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

interface ImageFile {
  file: File;
  id: string;
  url: string;
}

const ImagesToPdfPage = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        file,
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
      }));
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
    if (images.length === 0) {
      toast.error("Add at least one image.");
      return;
    }
    setProcessing(true);
    try {
      const pdf = await PDFDocument.create();

      for (const img of images) {
        const buffer = await img.file.arrayBuffer();
        const uint8 = new Uint8Array(buffer);

        let embeddedImage;
        if (img.file.type === "image/png") {
          embeddedImage = await pdf.embedPng(uint8);
        } else {
          embeddedImage = await pdf.embedJpg(uint8);
        }

        const page = pdf.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
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
    <ToolPageLayout
      title="Images to PDF"
      description="Convert images into a PDF document"
      accentColor="hsl(45, 93%, 47%)"
      icon={<ImagePlus className="h-5 w-5" />}
    >
      <FileDropZone
        onFiles={handleFiles}
        accept=".jpg,.jpeg,.png"
        multiple
        label="Drop images here"
        sublabel="JPG or PNG — add multiple files"
      />

      {images.length > 0 && (
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-xs" onClick={() => moveImage(i, -1)} disabled={i === 0}>↑</Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-xs" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}>↓</Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeImage(img.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {images.length > 0 && (
        <Button onClick={handleConvert} disabled={processing} className="w-full" size="lg">
          <Download className="mr-2 h-4 w-4" />
          {processing ? "Creating PDF…" : `Create PDF from ${images.length} Image${images.length > 1 ? "s" : ""}`}
        </Button>
      )}
    </ToolPageLayout>
  );
};

export default ImagesToPdfPage;
