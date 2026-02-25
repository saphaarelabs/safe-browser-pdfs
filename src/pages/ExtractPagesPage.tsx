import { useState, useCallback } from "react";
import { FileUp, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

const ExtractPagesPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResult(null);
    setSelectedPages(new Set());
    const buffer = await f.arrayBuffer();
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    setPageCount(pdf.getPageCount());
  }, []);

  const togglePage = (idx: number) => {
    const next = new Set(selectedPages);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setSelectedPages(next);
  };

  const handleExtract = async () => {
    if (!file || selectedPages.size === 0) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const indices = Array.from(selectedPages).sort((a, b) => a - b);
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdf, indices);
      pages.forEach((p) => newPdf.addPage(p));
      const bytes = await newPdf.save();
      setResult(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      toast.success(`Extracted ${selectedPages.size} page(s)!`);
    } catch {
      toast.error("Failed to extract pages.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Extract Pages" description="Pull specific pages into a new PDF" accentColor="hsl(280, 55%, 50%)" icon={<FileUp className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file" />
      ) : (
        <>
          <Card><CardContent className="p-6">
            <p className="font-semibold">{file.name}</p>
            <p className="text-sm text-muted-foreground">{pageCount} pages</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setFile(null); setResult(null); }}>Choose different file</Button>
          </CardContent></Card>
          <Card><CardContent className="p-6">
            <Label className="font-semibold mb-3 block">Select pages to extract</Label>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: pageCount }, (_, i) => (
                <label key={i} className={`flex items-center gap-1.5 rounded p-2 text-sm cursor-pointer ${selectedPages.has(i) ? "bg-primary/10 text-primary" : "hover:bg-secondary"}`}>
                  <Checkbox checked={selectedPages.has(i)} onCheckedChange={() => togglePage(i)} />
                  {i + 1}
                </label>
              ))}
            </div>
          </CardContent></Card>
          <div className="flex gap-3">
            <Button onClick={handleExtract} disabled={processing || selectedPages.size === 0} className="flex-1" size="lg">
              {processing ? "Extracting…" : `Extract ${selectedPages.size} page(s)`}
            </Button>
            {result && <Button onClick={() => saveAs(result, `extracted-${file.name}`)} size="lg" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Download</Button>}
          </div>
        </>
      )}
    </ToolPageLayout>
  );
};

export default ExtractPagesPage;
