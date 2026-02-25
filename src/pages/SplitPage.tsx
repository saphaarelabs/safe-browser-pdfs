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
import { toast } from "sonner";

type SplitMode = "pages" | "individual" | "every-n";

function parsePageRanges(input: string, max: number): number[] {
  const pages = new Set<number>();
  for (const part of input.split(",")) {
    const trimmed = part.trim();
    const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = Math.max(1, parseInt(rangeMatch[1]));
      const end = Math.min(max, parseInt(rangeMatch[2]));
      for (let i = start; i <= end; i++) pages.add(i - 1);
    } else {
      const num = parseInt(trimmed);
      if (!isNaN(num) && num >= 1 && num <= max) pages.add(num - 1);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

const SplitPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<SplitMode>("pages");
  const [pageInput, setPageInput] = useState("");
  const [everyN, setEveryN] = useState(1);
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

  const handleSplit = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const total = sourcePdf.getPageCount();

      let chunks: number[][] = [];

      if (mode === "pages") {
        const indices = parsePageRanges(pageInput, total);
        if (!indices.length) { toast.error("Enter valid page numbers."); setProcessing(false); return; }
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
    >
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{pageCount} pages · {(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setPageCount(0); }}>
                Choose different file
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <RadioGroup value={mode} onValueChange={(v) => setMode(v as SplitMode)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pages" id="pages" />
                  <Label htmlFor="pages">Extract specific pages</Label>
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

              {mode === "pages" && (
                <div>
                  <Label className="text-xs text-muted-foreground">e.g. 1, 3-5, 8</Label>
                  <Input value={pageInput} onChange={(e) => setPageInput(e.target.value)} placeholder="1, 3-5, 8" />
                </div>
              )}
              {mode === "every-n" && (
                <div>
                  <Label className="text-xs text-muted-foreground">Pages per chunk</Label>
                  <Input type="number" min={1} max={pageCount} value={everyN} onChange={(e) => setEveryN(parseInt(e.target.value) || 1)} />
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleSplit}
            disabled={processing}
            className="w-full"
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
