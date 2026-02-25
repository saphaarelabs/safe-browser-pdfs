import { useState, useCallback } from "react";
import { Hash, Download } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

type Position = "bottom-center" | "bottom-right" | "top-center";

const PageNumbersPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    const buffer = await f.arrayBuffer();
    setFileBytes(buffer);
    try {
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch {
      toast.error("Could not read this PDF.");
    }
  }, []);

  const handleAddNumbers = async () => {
    if (!file || !fileBytes) return;
    setProcessing(true);
    try {
      const pdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const total = pages.length;

      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const text = `${i + 1} / ${total}`;
        const textWidth = font.widthOfTextAtSize(text, 10);
        let x: number, y: number;
        if (position === "bottom-center") { x = (width - textWidth) / 2; y = 20; }
        else if (position === "bottom-right") { x = width - textWidth - 30; y = 20; }
        else { x = (width - textWidth) / 2; y = height - 30; }
        page.drawText(text, { x, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      });

      const bytes = await pdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `numbered-${file.name}`);
      toast.success("Page numbers added!");
    } catch (err) {
      toast.error("Failed to add page numbers.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Page Numbers" description="Add page numbers with position preview" accentColor="hsl(45, 90%, 50%)" icon={<Hash className="h-5 w-5" />}>
      {!file || !fileBytes ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{pageCount} pages</p>
            </div>
            <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => { setFile(null); setFileBytes(null); setPageCount(0); }}>Change file</Button>
          </div>

          {/* Live position preview */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-semibold mb-2 block">Preview</Label>
              <div className="relative border rounded-lg bg-card flex flex-col" style={{ minHeight: 180 }}>
                {/* Top */}
                <div className="flex justify-center p-2">
                  {position === "top-center" && <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">1 / {pageCount}</span>}
                </div>
                {/* Content placeholder */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="space-y-1.5 w-2/3">
                    <div className="h-2 bg-muted rounded w-full" />
                    <div className="h-2 bg-muted rounded w-4/5" />
                    <div className="h-2 bg-muted rounded w-full" />
                    <div className="h-2 bg-muted rounded w-3/5" />
                  </div>
                </div>
                {/* Bottom */}
                <div className={`flex p-2 ${position === "bottom-right" ? "justify-end pr-4" : "justify-center"}`}>
                  {(position === "bottom-center" || position === "bottom-right") && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">1 / {pageCount}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-4">
              <Label className="font-semibold text-sm">Number Position</Label>
              <RadioGroup value={position} onValueChange={(v) => setPosition(v as Position)}>
                <div className="flex items-center space-x-2 min-h-[44px]">
                  <RadioGroupItem value="bottom-center" id="pn-bc" />
                  <Label htmlFor="pn-bc">Bottom center</Label>
                </div>
                <div className="flex items-center space-x-2 min-h-[44px]">
                  <RadioGroupItem value="bottom-right" id="pn-br" />
                  <Label htmlFor="pn-br">Bottom right</Label>
                </div>
                <div className="flex items-center space-x-2 min-h-[44px]">
                  <RadioGroupItem value="top-center" id="pn-tc" />
                  <Label htmlFor="pn-tc">Top center</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Button onClick={handleAddNumbers} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Adding numbers…" : "Add Numbers & Download"}
          </Button>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default PageNumbersPage;
