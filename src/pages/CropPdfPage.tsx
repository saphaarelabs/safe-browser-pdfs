import { useState, useCallback } from "react";
import { Crop, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

const CropPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [margins, setMargins] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFiles = useCallback((files: File[]) => { setFile(files[0]); setResult(null); }, []);

  const handleCrop = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = pdf.getPages();
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.setCropBox(
          margins.left,
          margins.bottom,
          width - margins.left - margins.right,
          height - margins.top - margins.bottom
        );
      });
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult(blob);
      toast.success("PDF cropped!");
    } catch {
      toast.error("Failed to crop PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Crop PDF" description="Trim margins and crop PDF pages" accentColor="hsl(340, 65%, 47%)" icon={<Crop className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF to crop" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setResult(null); }}>Choose different file</Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Label className="font-semibold">Crop margins (points)</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["top", "right", "bottom", "left"] as const).map((side) => (
                  <div key={side}>
                    <Label className="text-xs text-muted-foreground capitalize">{side}</Label>
                    <Input type="number" min={0} value={margins[side]} onChange={(e) => setMargins({ ...margins, [side]: Number(e.target.value) })} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button onClick={handleCrop} disabled={processing} className="flex-1" size="lg">{processing ? "Cropping…" : "Crop PDF"}</Button>
            {result && <Button onClick={() => saveAs(result, `cropped-${file.name}`)} size="lg" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Download</Button>}
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default CropPdfPage;
