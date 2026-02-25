import { useState, useCallback } from "react";
import { Stamp, Download } from "lucide-react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
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

type Position = "center" | "bottom-right";

const WatermarkPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.15);
  const [position, setPosition] = useState<Position>("center");
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    setFile(files[0]);
  }, []);

  const handleWatermark = async () => {
    if (!file || !text.trim()) {
      toast.error("Please provide watermark text.");
      return;
    }
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);

      pdf.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        let x: number, y: number;
        if (position === "center") {
          x = (width - textWidth) / 2;
          y = height / 2;
        } else {
          x = width - textWidth - 30;
          y = 30;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity,
          rotate: position === "center" ? degrees(-45) : undefined,
        });
      });

      const bytes = await pdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `watermarked-${file.name}`);
      toast.success("Watermark added!");
    } catch (err) {
      toast.error("Failed to add watermark.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Watermark PDF"
      description="Add text watermarks to your PDF"
      accentColor="hsl(200, 80%, 50%)"
      icon={<Stamp className="h-5 w-5" />}
    >
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>
                Choose different file
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-6">
              <div>
                <Label className="font-semibold">Watermark Text</Label>
                <Input value={text} onChange={(e) => setText(e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label className="font-semibold">Font Size: {fontSize}px</Label>
                <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={12} max={120} step={2} className="mt-2" />
              </div>

              <div>
                <Label className="font-semibold">Opacity: {Math.round(opacity * 100)}%</Label>
                <Slider value={[opacity]} onValueChange={(v) => setOpacity(v[0])} min={0.05} max={0.5} step={0.05} className="mt-2" />
              </div>

              <div>
                <Label className="font-semibold">Position</Label>
                <RadioGroup value={position} onValueChange={(v) => setPosition(v as Position)} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="center" id="wm-center" />
                    <Label htmlFor="wm-center">Center (diagonal)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom-right" id="wm-br" />
                    <Label htmlFor="wm-br">Bottom right</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleWatermark}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Adding watermark…" : "Add Watermark & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default WatermarkPage;
