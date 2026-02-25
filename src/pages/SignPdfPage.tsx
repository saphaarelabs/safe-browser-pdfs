import { useState, useCallback, useRef } from "react";
import { FileSignature, Download, Move } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import PdfViewer from "@/components/PdfViewer";
import SignaturePad from "@/components/SignaturePad";
import { toast } from "sonner";

const SignPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [sigDataUrl, setSigDataUrl] = useState<string | null>(null);
  const [sigPos, setSigPos] = useState<{ x: number; y: number }>({ x: 0.7, y: 0.1 }); // normalized 0-1
  const [sigScale, setSigScale] = useState(0.2); // fraction of page width
  const [currentPage, setCurrentPage] = useState(0);
  const [allPages, setAllPages] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    const bytes = await f.arrayBuffer();
    setFileBytes(bytes);
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageCount(pdf.getPageCount());
  }, []);

  const handleCanvasClick = useCallback((x: number, y: number, pw: number, ph: number) => {
    setSigPos({ x: x / pw, y: 1 - y / ph }); // pdf-lib uses bottom-left origin
  }, []);

  const handleSign = async () => {
    if (!file || !fileBytes || !sigDataUrl) {
      toast.error("Please create a signature first.");
      return;
    }
    setProcessing(true);
    try {
      const pdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });

      // Fetch the signature image
      const sigResponse = await fetch(sigDataUrl);
      const sigBytes = await sigResponse.arrayBuffer();
      const sigImg = await pdf.embedPng(new Uint8Array(sigBytes));

      const pages = pdf.getPages();
      const pagesToSign = allPages ? pages : [pages[currentPage] || pages[pages.length - 1]];

      pagesToSign.forEach((page) => {
        const { width, height } = page.getSize();
        const sigW = width * sigScale;
        const sigH = (sigImg.height / sigImg.width) * sigW;
        const x = Math.max(0, Math.min(width - sigW, sigPos.x * width - sigW / 2));
        const y = Math.max(0, Math.min(height - sigH, sigPos.y * height - sigH / 2));

        page.drawImage(sigImg, { x, y, width: sigW, height: sigH });
      });

      const bytes = await pdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `signed-${file.name}`);
      toast.success("Signature added!");
    } catch (err) {
      toast.error("Failed to sign PDF.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Sign PDF"
      description="Draw, type, or upload your signature and place it on your PDF"
      accentColor="hsl(173, 58%, 39%)"
      icon={<FileSignature className="h-5 w-5" />}
    >
      {!file || !fileBytes ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{pageCount} pages</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs min-h-[44px]" onClick={() => { setFile(null); setFileBytes(null); setSigDataUrl(null); }}>
              Change file
            </Button>
          </div>

          {/* Signature creation */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Label className="font-semibold text-sm">Create Your Signature</Label>
              <SignaturePad onSignature={setSigDataUrl} />
            </CardContent>
          </Card>

          {/* Preview with click-to-place */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-muted-foreground" />
                <Label className="font-semibold text-sm">Click on the page to position your signature</Label>
              </div>
              <PdfViewer
                fileBytes={fileBytes}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onCanvasClick={handleCanvasClick}
                overlay={
                  sigDataUrl ? (
                    <div
                      className="absolute pointer-events-none border-2 border-dashed border-primary/60 rounded bg-primary/5"
                      style={{
                        left: `${sigPos.x * 100}%`,
                        bottom: `${sigPos.y * 100}%`,
                        transform: "translate(-50%, 50%)",
                        width: `${sigScale * 100}%`,
                      }}
                    >
                      <img src={sigDataUrl} alt="Signature preview" className="w-full h-auto opacity-80" />
                    </div>
                  ) : null
                }
              />
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Signature Size: {Math.round(sigScale * 100)}%</Label>
                <Slider value={[sigScale]} onValueChange={(v) => setSigScale(v[0])} min={0.05} max={0.5} step={0.01} className="mt-2" />
              </div>
              <div className="flex items-center gap-2 min-h-[44px]">
                <Checkbox id="all-pages-sign" checked={allPages} onCheckedChange={(c) => setAllPages(!!c)} />
                <Label htmlFor="all-pages-sign" className="text-sm">Sign all pages (default: current page only)</Label>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSign} disabled={processing || !sigDataUrl} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Signing…" : "Sign & Download"}
          </Button>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default SignPdfPage;
