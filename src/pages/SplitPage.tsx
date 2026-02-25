import { useState, useCallback } from "react";
import { Scissors, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import PdfPageThumbnail from "@/components/PdfPageThumbnail";
import { toast } from "sonner";

type SplitMode = "pages" | "individual" | "every-n";

const SplitPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<SplitMode>("pages");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [everyN, setEveryN] = useState(1);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    try {
      const buffer = await f.arrayBuffer();
      setFileBytes(buffer);
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
      setSelectedPages(new Set());
    } catch {
      toast.error("Could not read this PDF.");
    }
  }, []);

  const togglePage = (idx: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const handleSplit = async () => {
    if (!file || !fileBytes) return;
    setProcessing(true);
    try {
      const sourcePdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const total = sourcePdf.getPageCount();
      let chunks: number[][] = [];

      if (mode === "pages") {
        const indices = Array.from(selectedPages).sort((a, b) => a - b);
        if (!indices.length) { toast.error("Select at least one page."); setProcessing(false); return; }
        chunks = [indices];
      } else if (mode === "individual") {
        chunks = Array.from({ length: total }, (_, i) => [i]);
      } else {
        const n = Math.max(1, everyN);
        for (let i = 0; i < total; i += n) {
          chunks.push(Array.from({ length: Math.min(n, total - i) }, (_, j) => i + j));
        }
      }

      if (chunks.length === 1) {
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(sourcePdf, chunks[0]);
        pages.forEach((p) => newPdf.addPage(p));
        const bytes = await newPdf.save();
        saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), "split.pdf");
      } else {
        const zip = new JSZip();
        for (let i = 0; i < chunks.length; i++) {
          const newPdf = await PDFDocument.create();
          const pages = await newPdf.copyPages(sourcePdf, chunks[i]);
          pages.forEach((p) => newPdf.addPage(p));
          const bytes = await newPdf.save();
          zip.file(`split-${i + 1}.pdf`, bytes as unknown as Uint8Array);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "split-pdfs.zip");
      }
      toast.success("PDF split successfully!");
    } catch (err) {
      toast.error("Failed to split PDF.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Split PDF"
      description="Extract pages or split into smaller files"
      accentColor="hsl(150, 70%, 42%)"
      icon={<Scissors className="h-5 w-5" />}
      wide
    >
      {!file || !fileBytes ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold truncate max-w-[200px]">{file.name}</p>
                <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => { setFile(null); setFileBytes(null); setPageCount(0); setSelectedPages(new Set()); }}>
                Change file
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <RadioGroup value={mode} onValueChange={(v) => setMode(v as SplitMode)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pages" id="pages" />
                  <Label htmlFor="pages">Extract specific pages (click thumbnails)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual">Split into individual pages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="every-n" id="every-n" />
                  <Label htmlFor="every-n">Split every N pages</Label>
                </div>
              </RadioGroup>

              {mode === "every-n" && (
                <div>
                  <Label className="text-xs text-muted-foreground">Pages per chunk</Label>
                  <Input type="number" min={1} max={pageCount} value={everyN} onChange={(e) => setEveryN(parseInt(e.target.value) || 1)} className="w-24" />
                </div>
              )}
            </CardContent>
          </Card>

          {mode === "pages" && fileBytes && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Click pages to select ({selectedPages.size} selected)</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="min-h-[44px]" onClick={() => setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i)))}>Select all</Button>
                  <Button variant="outline" size="sm" className="min-h-[44px]" onClick={() => setSelectedPages(new Set())}>Clear</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({ length: pageCount }, (_, i) => (
                  <PdfPageThumbnail
                    key={i}
                    fileBytes={fileBytes}
                    pageIndex={i}
                    width={140}
                    selected={selectedPages.has(i)}
                    onClick={() => togglePage(i)}
                    label={`Page ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSplit}
            disabled={processing || (mode === "pages" && selectedPages.size === 0)}
            className="w-full min-h-[44px]"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Splitting…" : "Split & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default SplitPage;
