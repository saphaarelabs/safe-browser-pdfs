import { useState, useCallback } from "react";
import { RotateCw, Download } from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

type RotationDeg = 90 | 180 | 270;

const RotatePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState<RotationDeg>(90);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch {
      toast.error("Could not read this PDF.");
    }
  }, []);

  const handleRotate = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      pdf.getPages().forEach((page) => {
        page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
      });
      const bytes = await pdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `rotated-${file.name}`);
      toast.success("PDF rotated successfully!");
    } catch (err) {
      toast.error("Failed to rotate PDF.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Rotate PDF"
      description="Rotate all pages by 90°, 180°, or 270°"
      accentColor="hsl(340, 80%, 55%)"
      icon={<RotateCw className="h-7 w-7" />}
    >
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>
                Choose different file
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <Label className="font-semibold">Rotation Angle</Label>
              <RadioGroup value={String(rotation)} onValueChange={(v) => setRotation(Number(v) as RotationDeg)}>
                {([90, 180, 270] as const).map((deg) => (
                  <div key={deg} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(deg)} id={`deg-${deg}`} />
                    <Label htmlFor={`deg-${deg}`}>{deg}° clockwise</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Button
            onClick={handleRotate}
            disabled={processing}
            className="w-full bg-tool-rotate text-primary-foreground hover:bg-tool-rotate/90"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Rotating…" : "Rotate & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default RotatePage;
