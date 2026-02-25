import { useState, useEffect, useRef } from "react";
import { QrCode, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const AddQrCodePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [text, setText] = useState("https://example.com");
  const [position, setPosition] = useState("bottom-right");
  const [qrSize, setQrSize] = useState("80");
  const [processing, setProcessing] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    try {
      const bytes = await f.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setPageCount(pdf.getPageCount());
    } catch {
      toast.error("Could not read this PDF.");
    }
  };

  // Generate live QR preview
  useEffect(() => {
    if (!text.trim() || !previewCanvasRef.current) return;
    QRCode.toCanvas(previewCanvasRef.current, text, {
      width: 160,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    }).catch(() => {});
  }, [text]);

  const handleAdd = async () => {
    if (!file || !text.trim()) return;
    setProcessing(true);
    try {
      // Generate QR as PNG data URL
      const qrDataUrl = await QRCode.toDataURL(text, { width: 400, margin: 1 });
      const qrResponse = await fetch(qrDataUrl);
      const qrArrayBuffer = await qrResponse.arrayBuffer();
      const qrPng = new Uint8Array(qrArrayBuffer);

      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const qrImage = await doc.embedPng(qrPng);
      const size = parseInt(qrSize);

      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        let x = width - size - 20;
        let y = 20;
        if (position === "top-right") { x = width - size - 20; y = height - size - 20; }
        else if (position === "top-left") { x = 20; y = height - size - 20; }
        else if (position === "bottom-left") { x = 20; y = 20; }
        page.drawImage(qrImage, { x, y, width: size, height: size });
      }

      const out = await doc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", "-qr.pdf");
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("QR code added to all pages!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add QR code.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Add QR Code" description="Embed a scannable QR code on every page of your PDF." accentColor="hsl(200, 65%, 50%)" icon={<QrCode className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFile} accept=".pdf" label="Drop a PDF here" />
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
              <div>
                <Label className="font-semibold">QR Code Content</Label>
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="URL or text" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Position</Label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-semibold">Size (px)</Label>
                  <Input type="number" min={40} max={200} value={qrSize} onChange={(e) => setQrSize(e.target.value)} className="mt-1 min-h-[44px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {text.trim() && (
            <Card>
              <CardContent className="p-6 flex flex-col items-center gap-2">
                <Label className="font-semibold text-sm">QR Preview</Label>
                <canvas ref={previewCanvasRef} className="rounded border" />
                <p className="text-xs text-muted-foreground text-center max-w-xs truncate">{text}</p>
              </CardContent>
            </Card>
          )}

          <Button onClick={handleAdd} disabled={processing || !text.trim()} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Adding QR…" : "Add QR Code & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default AddQrCodePage;
