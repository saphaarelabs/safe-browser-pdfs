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
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<Position>("bottom-center");
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

  const handleAddNumbers = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const total = pages.length;

      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const text = `${i + 1} / ${total}`;
        const textWidth = font.widthOfTextAtSize(text, 10);

        let x: number, y: number;
        if (position === "bottom-center") {
          x = (width - textWidth) / 2;
          y = 20;
        } else if (position === "bottom-right") {
          x = width - textWidth - 30;
          y = 20;
        } else {
          x = (width - textWidth) / 2;
          y = height - 30;
        }

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
    <ToolPageLayout
      title="Page Numbers"
      description="Add page numbers to your PDF"
      accentColor="hsl(45, 90%, 50%)"
      icon={<Hash className="h-5 w-5" />}
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
              <Label className="font-semibold">Number Position</Label>
              <RadioGroup value={position} onValueChange={(v) => setPosition(v as Position)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bottom-center" id="pn-bc" />
                  <Label htmlFor="pn-bc">Bottom center</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bottom-right" id="pn-br" />
                  <Label htmlFor="pn-br">Bottom right</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="top-center" id="pn-tc" />
                  <Label htmlFor="pn-tc">Top center</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Button
            onClick={handleAddNumbers}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Adding numbers…" : "Add Numbers & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default PageNumbersPage;
