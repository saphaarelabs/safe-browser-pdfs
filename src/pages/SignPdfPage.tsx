import { useState, useCallback } from "react";
import { FileSignature, Download } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

type Position = "bottom-right" | "bottom-left" | "bottom-center";

const SignPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [signText, setSignText] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [allPages, setAllPages] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    setFile(files[0]);
  }, []);

  const handleSign = async () => {
    if (!file || !signText.trim()) {
      toast.error("Please enter signature text.");
      return;
    }
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.Courier);
      const pages = pdf.getPages();
      const pagesToSign = allPages ? pages : [pages[pages.length - 1]];

      pagesToSign.forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(signText, fontSize);

        let x: number;
        if (position === "bottom-right") x = width - textWidth - 40;
        else if (position === "bottom-left") x = 40;
        else x = (width - textWidth) / 2;

        page.drawText(signText, {
          x,
          y: 40,
          size: fontSize,
          font,
          color: rgb(0.1, 0.1, 0.1),
        });
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
      description="Add a text signature to your PDF"
      accentColor="hsl(173, 58%, 39%)"
      icon={<FileSignature className="h-5 w-5" />}
    >
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{file.name}</p>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setFile(null)}>
              Change file
            </Button>
          </div>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Signature Text</Label>
                <Input value={signText} onChange={(e) => setSignText(e.target.value)} placeholder="Your Name" className="mt-1" />
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Font Size: {fontSize}px</Label>
                <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={8} max={36} step={1} className="mt-2" />
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Position</Label>
                <RadioGroup value={position} onValueChange={(v) => setPosition(v as Position)} className="mt-2 space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-right" id="s-br" />
                    <Label htmlFor="s-br" className="text-sm">Bottom right</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-left" id="s-bl" />
                    <Label htmlFor="s-bl" className="text-sm">Bottom left</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-center" id="s-bc" />
                    <Label htmlFor="s-bc" className="text-sm">Bottom center</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="all-pages"
                  checked={allPages}
                  onChange={(e) => setAllPages(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="all-pages" className="text-sm">Sign all pages (default: last page only)</Label>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSign} disabled={processing || !signText.trim()} className="w-full" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Signing…" : "Sign & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default SignPdfPage;
