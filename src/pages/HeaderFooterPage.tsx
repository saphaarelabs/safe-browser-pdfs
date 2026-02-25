import { useState } from "react";
import { AlignVerticalSpaceAround } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import PdfViewer from "@/components/PdfViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const HeaderFooterPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [fontSize, setFontSize] = useState("10");
  const [processing, setProcessing] = useState(false);

  const handleFiles = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setFileBytes(await f.arrayBuffer());
  };

  const handleApply = async () => {
    if (!file || !fileBytes || (!headerText && !footerText)) return;
    setProcessing(true);
    try {
      const doc = await PDFDocument.load(fileBytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const size = parseInt(fontSize);
      const pages = doc.getPages();
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        if (headerText) {
          const text = headerText.replace("{n}", String(i + 1)).replace("{total}", String(pages.length));
          const tw = font.widthOfTextAtSize(text, size);
          page.drawText(text, { x: (width - tw) / 2, y: height - 30, size, font, color: rgb(0.3, 0.3, 0.3) });
        }
        if (footerText) {
          const text = footerText.replace("{n}", String(i + 1)).replace("{total}", String(pages.length));
          const tw = font.widthOfTextAtSize(text, size);
          page.drawText(text, { x: (width - tw) / 2, y: 20, size, font, color: rgb(0.3, 0.3, 0.3) });
        }
      }
      const out = await doc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", "-headerfooter.pdf");
      a.click();
      toast.success("Header/Footer added!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to apply header/footer.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Add Header/Footer" description="Add custom header and footer text with live preview." accentColor="hsl(170, 55%, 45%)" icon={<AlignVerticalSpaceAround className="h-5 w-5" />}>
      {!file || !fileBytes ? (
        <FileDropZone onFiles={handleFiles} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
            <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => { setFile(null); setFileBytes(null); }}>Change file</Button>
          </div>

          {/* Live preview showing where header/footer would appear */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Label className="text-sm font-semibold">Preview</Label>
              <div className="relative border rounded-lg bg-card p-4 min-h-[200px] flex flex-col justify-between text-center">
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))", fontSize: `${parseInt(fontSize)}px` }}>
                  {headerText ? headerText.replace("{n}", "1").replace("{total}", "5") : <span className="opacity-30">Header text appears here</span>}
                </p>
                <p className="text-xs text-muted-foreground">[ Page content ]</p>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))", fontSize: `${parseInt(fontSize)}px` }}>
                  {footerText ? footerText.replace("{n}", "1").replace("{total}", "5") : <span className="opacity-30">Footer text appears here</span>}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Header Text</Label>
                <Input value={headerText} onChange={(e) => setHeaderText(e.target.value)} placeholder="e.g. Confidential — Page {n} of {total}" className="min-h-[44px]" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Footer Text</Label>
                <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="e.g. © 2025 Company Name" className="min-h-[44px]" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Font Size</Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="w-24 min-h-[44px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["8", "9", "10", "11", "12", "14"].map((s) => <SelectItem key={s} value={s}>{s}pt</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Use <code>{"{n}"}</code> for page number and <code>{"{total}"}</code> for total pages.</p>
            </CardContent>
          </Card>

          <Button onClick={handleApply} disabled={processing || (!headerText && !footerText)} className="w-full min-h-[44px]" size="lg">
            {processing ? "Applying…" : "Apply & Download"}
          </Button>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default HeaderFooterPage;
