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
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.15);
  const [position, setPosition] = useState<Position>("center");
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setFileBytes(await f.arrayBuffer());
  }, []);

  const handleWatermark = async () => {
    if (!file || !fileBytes || !text.trim()) {
      toast.error("Please provide watermark text.");
      return;
    }
    setProcessing(true);
    try {
      const pdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);

      pdf.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        let x: number, y: number;
        if (position === "center") { x = (width - textWidth) / 2; y = height / 2; }
        else { x = width - textWidth - 30; y = 30; }
        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.5, 0.5, 0.5), opacity, rotate: position === "center" ? degrees(-45) : undefined });
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
    <ToolPageLayout title="Watermark PDF" description="Add text watermarks with live preview" accentColor="hsl(200, 80%, 50%)" icon={<Stamp className="h-5 w-5" />}>
      {!file || !fileBytes ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => { setFile(null); setFileBytes(null); }}>Change file</Button>
          </div>

          {/* Live watermark preview */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-semibold mb-2 block">Preview</Label>
              <div className="relative border rounded-lg bg-card overflow-hidden" style={{ minHeight: 220 }}>
                <div className="p-6 text-xs text-muted-foreground space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
                {/* Watermark overlay */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    ...(position === "center"
                      ? { top: "50%", left: "50%", transform: `translate(-50%, -50%) rotate(-45deg)` }
                      : { bottom: 12, right: 16 }),
                    fontSize: `${Math.min(fontSize, 36)}px`,
                    opacity,
                    color: "hsl(var(--muted-foreground))",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {text}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-4">
              <div>
                <Label className="font-semibold text-sm">Watermark Text</Label>
                <Input value={text} onChange={(e) => setText(e.target.value)} className="mt-1 min-h-[44px]" />
              </div>
              <div>
                <Label className="font-semibold text-sm">Font Size: {fontSize}px</Label>
                <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={12} max={120} step={2} className="mt-2" />
              </div>
              <div>
                <Label className="font-semibold text-sm">Opacity: {Math.round(opacity * 100)}%</Label>
                <Slider value={[opacity]} onValueChange={(v) => setOpacity(v[0])} min={0.05} max={0.5} step={0.05} className="mt-2" />
              </div>
              <div>
                <Label className="font-semibold text-sm">Position</Label>
                <RadioGroup value={position} onValueChange={(v) => setPosition(v as Position)} className="mt-2">
                  <div className="flex items-center space-x-2 min-h-[44px]">
                    <RadioGroupItem value="center" id="wm-center" />
                    <Label htmlFor="wm-center">Center (diagonal)</Label>
                  </div>
                  <div className="flex items-center space-x-2 min-h-[44px]">
                    <RadioGroupItem value="bottom-right" id="wm-br" />
                    <Label htmlFor="wm-br">Bottom right</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleWatermark} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Adding watermark…" : "Add Watermark & Download"}
          </Button>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default WatermarkPage;
