import { useState, useEffect } from "react";
import { ImageIcon } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formats = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

const ConvertImagePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [format, setFormat] = useState("image/png");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise((r) => (img.onload = r));
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const fmt = formats.find((f) => f.value === format)!;
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        const baseName = file.name.replace(/\.[^.]+$/, "");
        a.download = `${baseName}.${fmt.ext}`;
        a.click();
      }, format, 0.92);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Convert Image Format" description="Convert images between PNG, JPG, and WebP formats." accentColor="hsl(300, 55%, 50%)" icon={<ImageIcon className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".png,.jpg,.jpeg,.webp,.bmp,.gif" label="Drop an image here" />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => setFile(null)}>Change</Button>
            </CardContent>
          </Card>

          {preview && (
            <div className="rounded-lg border bg-muted/30 p-2 flex items-center justify-center overflow-hidden" style={{ maxHeight: "300px" }}>
              <img src={preview} alt="Preview" className="max-w-full max-h-[280px] object-contain rounded" />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1.5 block">Output Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {formats.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={processing} className="flex-1 min-h-[44px]" size="lg">{processing ? "Converting…" : "Convert & Download"}</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default ConvertImagePage;
