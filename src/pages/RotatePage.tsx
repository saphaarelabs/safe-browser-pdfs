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
import PdfPageThumbnail from "@/components/PdfPageThumbnail";
import { toast } from "sonner";

type RotationDeg = 90 | 180 | 270;

const RotatePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState<RotationDeg>(90);
  const [perPage, setPerPage] = useState<Record<number, number>>({});
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setPerPage({});
    try {
      const buffer = await f.arrayBuffer();
      setFileBytes(buffer);
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch {
      toast.error("Could not read this PDF.");
    }
  }, []);

  const togglePageRotation = (pageIdx: number) => {
    setPerPage((prev) => {
      const current = prev[pageIdx] || 0;
      const next = (current + 90) % 360;
      const copy = { ...prev };
      if (next === 0) delete copy[pageIdx];
      else copy[pageIdx] = next;
      return copy;
    });
  };

  const handleRotate = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const hasPerPage = Object.keys(perPage).length > 0;
      pdf.getPages().forEach((page, i) => {
        const angle = hasPerPage ? (perPage[i] || 0) : rotation;
        if (angle > 0) {
          page.setRotation(degrees((page.getRotation().angle + angle) % 360));
        }
      });
      const bytes = await pdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `rotated-${file.name}`);
      toast.success("PDF rotated!");
    } catch (err) {
      toast.error("Failed to rotate PDF.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const hasPerPage = Object.keys(perPage).length > 0;

  return (
    <ToolPageLayout title="Rotate PDF" description="Rotate all pages or click individual pages to rotate them." accentColor="hsl(340, 80%, 55%)" icon={<RotateCw className="h-5 w-5" />} wide>
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
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
            <CardContent className="space-y-4 p-6">
              <Label className="font-semibold">Global Rotation (all pages)</Label>
              <RadioGroup value={String(rotation)} onValueChange={(v) => setRotation(Number(v) as RotationDeg)}>
                {([90, 180, 270] as const).map((deg) => (
                  <div key={deg} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(deg)} id={`deg-${deg}`} />
                    <Label htmlFor={`deg-${deg}`}>{deg}° clockwise</Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">Or click individual pages below to rotate them independently (90° per click).</p>
            </CardContent>
          </Card>

          {pageCount > 0 && pageCount <= 50 && fileBytes && (
            <Card>
              <CardContent className="p-6">
                <Label className="font-semibold mb-3 block">Per-Page Rotation (click to rotate)</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <button key={i} onClick={() => togglePageRotation(i)} className="relative group">
                      <div style={{ transform: `rotate(${perPage[i] || 0}deg)`, transition: "transform 0.2s" }}>
                        <PdfPageThumbnail fileBytes={fileBytes} pageIndex={i} width={80} />
                      </div>
                      <span className="absolute bottom-0 left-0 right-0 bg-foreground/70 text-background text-[10px] py-0.5 text-center">
                        {i + 1}{perPage[i] ? ` (${perPage[i]}°)` : ""}
                      </span>
                    </button>
                  ))}
                </div>
                {hasPerPage && <p className="text-xs text-muted-foreground mt-2">{Object.keys(perPage).length} page(s) with custom rotation</p>}
              </CardContent>
            </Card>
          )}

          <Button onClick={handleRotate} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Rotating…" : hasPerPage ? "Rotate Selected & Download" : "Rotate All & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default RotatePage;
