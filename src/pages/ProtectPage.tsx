import { useState, useCallback } from "react";
import { RefreshCcw, Download, AlertTriangle } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

const ProtectPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch { /* ignore */ }
  }, []);

  const handleClean = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((p) => newPdf.addPage(p));

      newPdf.setTitle(sourcePdf.getTitle() || "");
      newPdf.setAuthor(sourcePdf.getAuthor() || "");
      newPdf.setSubject(sourcePdf.getSubject() || "");

      const bytes = await newPdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `clean-${file.name}`);
      toast.success("PDF re-serialized successfully! Existing restrictions have been stripped.");
    } catch (err) {
      toast.error("Failed to process PDF.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Clean / Re-serialize PDF" description="Strip existing restrictions and re-create a clean copy of your PDF" accentColor="hsl(200, 60%, 50%)" icon={<RefreshCcw className="h-5 w-5" />}>
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

          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">What this tool does</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This tool re-serializes your PDF — it copies all pages into a brand-new document, which strips existing restrictions (copy/print locks).
                    It does <strong>not</strong> add password encryption. True PDF encryption (AES/RC4) requires native libraries not available in browsers.
                    For password protection, use <code className="text-xs bg-secondary px-1 rounded">qpdf</code> or Adobe Acrobat.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleClean} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Processing…" : "Re-serialize & Download Clean PDF"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default ProtectPage;
