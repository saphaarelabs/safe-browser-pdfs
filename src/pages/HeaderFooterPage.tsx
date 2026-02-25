import { useState } from "react";
import { AlignVerticalSpaceAround } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HeaderFooterPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [fontSize, setFontSize] = useState("10");
  const [processing, setProcessing] = useState(false);

  const handleApply = async () => {
    if (!file || (!headerText && !footerText)) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
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
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Add Header/Footer" description="Add custom header and footer text to every page." accentColor="hsl(170, 55%, 45%)" icon={<AlignVerticalSpaceAround className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => setFile(f[0])} accept=".pdf" label="Drop a PDF here" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Selected: <strong>{file.name}</strong></p>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Header Text</label>
            <Input value={headerText} onChange={(e) => setHeaderText(e.target.value)} placeholder="e.g. Confidential — Page {n} of {total}" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Footer Text</label>
            <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="e.g. © 2025 Company Name" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Font Size</label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["8", "9", "10", "11", "12", "14"].map((s) => <SelectItem key={s} value={s}>{s}pt</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">Use <code>{"{n}"}</code> for page number and <code>{"{total}"}</code> for total pages.</p>
          <div className="flex gap-2">
            <Button onClick={handleApply} disabled={processing || (!headerText && !footerText)}>{processing ? "Applying…" : "Apply & Download"}</Button>
            <Button variant="outline" onClick={() => setFile(null)}>Clear</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default HeaderFooterPage;
