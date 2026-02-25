import { useState, useCallback } from "react";
import { Scaling, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const presets: Record<string, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
  a3: [841.89, 1190.55],
  a5: [420.95, 595.28],
};

const ResizePdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [preset, setPreset] = useState("a4");
  const [customW, setCustomW] = useState("612");
  const [customH, setCustomH] = useState("792");
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      setPageCount(pdf.getPageCount());
    } catch { toast.error("Could not read PDF."); }
  }, []);

  const handleResize = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const src = await PDFDocument.load(buffer);
      const doc = await PDFDocument.create();

      const [targetW, targetH] = preset === "custom"
        ? [parseFloat(customW), parseFloat(customH)]
        : presets[preset];

      for (let i = 0; i < src.getPageCount(); i++) {
        const srcPage = src.getPage(i);
        const { width: origW, height: origH } = srcPage.getSize();
        const [copiedPage] = await doc.copyPages(src, [i]);
        const page = doc.addPage([targetW, targetH]);

        // Scale content to fit new page
        const scaleX = targetW / origW;
        const scaleY = targetH / origH;
        const scale = Math.min(scaleX, scaleY);
        const offsetX = (targetW - origW * scale) / 2;
        const offsetY = (targetH - origH * scale) / 2;

        const embedded = await doc.embedPage(copiedPage);
        page.drawPage(embedded, {
          x: offsetX,
          y: offsetY,
          width: origW * scale,
          height: origH * scale,
        });
      }

      const out = await doc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", "-resized.pdf");
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("PDF pages resized!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to resize PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Resize PDF Pages" description="Change page dimensions with content scaling." accentColor="hsl(210, 60%, 50%)" icon={<Scaling className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>Choose different file</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="font-semibold">Target Page Size</Label>
                <Select value={preset} onValueChange={setPreset}>
                  <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                    <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                    <SelectItem value="legal">Legal (8.5 × 14 in)</SelectItem>
                    <SelectItem value="a3">A3 (297 × 420 mm)</SelectItem>
                    <SelectItem value="a5">A5 (148 × 210 mm)</SelectItem>
                    <SelectItem value="custom">Custom (points)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {preset === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Width (pt)</Label>
                    <Input type="number" value={customW} onChange={(e) => setCustomW(e.target.value)} className="mt-1 min-h-[44px]" />
                  </div>
                  <div>
                    <Label>Height (pt)</Label>
                    <Input type="number" value={customH} onChange={(e) => setCustomH(e.target.value)} className="mt-1 min-h-[44px]" />
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Content will be scaled proportionally to fit the new dimensions.</p>
            </CardContent>
          </Card>

          <Button onClick={handleResize} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Resizing…" : "Resize & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default ResizePdfPage;
