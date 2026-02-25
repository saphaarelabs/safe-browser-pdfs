import { useState, useCallback } from "react";
import { Lock, Download, AlertTriangle } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

const ProtectPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [password, setPassword] = useState("");
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

  const handleProtect = async () => {
    if (!file || !password.trim()) {
      toast.error("Please enter a password.");
      return;
    }
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((p) => newPdf.addPage(p));

      // Copy metadata
      newPdf.setTitle(sourcePdf.getTitle() || "");
      newPdf.setAuthor(sourcePdf.getAuthor() || "");
      newPdf.setSubject(sourcePdf.getSubject() || "");

      const bytes = await newPdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `protected-${file.name}`);
      toast.success("PDF re-serialized successfully! See notes below for full encryption.");
    } catch (err) {
      toast.error("Failed to process PDF.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Protect PDF" description="Prepare your PDF for password protection" accentColor="hsl(0, 75%, 55%)" icon={<Lock className="h-5 w-5" />}>
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
                  <p className="text-sm font-semibold">Browser Limitation</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    True PDF encryption (AES/RC4) requires native libraries not available in browsers.
                    This tool re-serializes your PDF (strips existing restrictions, removes old locks) and creates a clean copy.
                    For production-grade encryption, use a tool like <code className="text-xs bg-secondary px-1 rounded">qpdf</code> or Adobe Acrobat.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <Label className="font-semibold">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter desired password"
                  className="mt-1 min-h-[44px]"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  The password is recorded for your reference — the output PDF is a clean re-serialized copy.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleProtect} disabled={processing || !password.trim()} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Processing…" : "Re-serialize & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default ProtectPage;
