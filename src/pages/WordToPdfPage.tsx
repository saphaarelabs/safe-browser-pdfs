import { useState, useCallback } from "react";
import { FileText, Download } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 50;
const LINE_HEIGHT = 16;
const HEADING_SIZE = 18;
const BODY_SIZE = 11;

function stripHtmlToBlocks(html: string): { type: "h1" | "h2" | "p" | "li"; text: string }[] {
  const blocks: { type: "h1" | "h2" | "p" | "li"; text: string }[] = [];
  const div = document.createElement("div");
  div.innerHTML = html;

  function walk(el: Element) {
    const tag = el.tagName?.toLowerCase();
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
      blocks.push({ type: tag.startsWith("h1") ? "h1" : "h2", text: el.textContent?.trim() || "" });
    } else if (tag === "li") {
      blocks.push({ type: "li", text: `• ${el.textContent?.trim() || ""}` });
    } else if (tag === "p" || tag === "div" || tag === "td" || tag === "th") {
      const t = el.textContent?.trim();
      if (t) blocks.push({ type: "p", text: t });
    } else if (tag === "br") {
      blocks.push({ type: "p", text: "" });
    } else {
      for (const child of Array.from(el.children)) walk(child);
      if (el.children.length === 0 && el.textContent?.trim()) {
        blocks.push({ type: "p", text: el.textContent.trim() });
      }
    }
  }
  for (const child of Array.from(div.children)) walk(child);
  if (blocks.length === 0 && div.textContent?.trim()) {
    blocks.push({ type: "p", text: div.textContent.trim() });
  }
  return blocks;
}

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(test, fontSize);
    if (width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

const WordToPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(10);
    try {
      const mammoth = await import("mammoth");
      const bytes = await file.arrayBuffer();
      setProgress(20);
      const result = await mammoth.convertToHtml({ arrayBuffer: bytes });
      setProgress(40);
      const blocks = stripHtmlToBlocks(result.value);

      const pdf = await PDFDocument.create();
      const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const maxWidth = PAGE_W - MARGIN * 2;

      let page = pdf.addPage([PAGE_W, PAGE_H]);
      let y = PAGE_H - MARGIN;

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const isHeading = block.type === "h1" || block.type === "h2";
        const fontSize = isHeading ? HEADING_SIZE : BODY_SIZE;
        const font = isHeading ? fontBold : fontRegular;
        const lineH = isHeading ? LINE_HEIGHT * 1.6 : LINE_HEIGHT;

        if (!block.text) {
          y -= LINE_HEIGHT;
          continue;
        }

        const lines = wrapText(block.text, font, fontSize, maxWidth);

        for (const line of lines) {
          if (y < MARGIN + lineH) {
            page = pdf.addPage([PAGE_W, PAGE_H]);
            y = PAGE_H - MARGIN;
          }
          page.drawText(line, { x: MARGIN, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
          y -= lineH;
        }

        // Extra spacing after headings
        if (isHeading) y -= 6;
        y -= 4;

        setProgress(40 + Math.round((i / blocks.length) * 50));
      }

      const pdfBytes = await pdf.save();
      setProgress(100);
      saveAs(new Blob([pdfBytes as BlobPart], { type: "application/pdf" }), file.name.replace(/\.docx?$/i, ".pdf"));
      toast.success("Word document converted to PDF!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to convert. Make sure it's a valid .docx file.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Word to PDF" description="Convert Word documents (.docx) to a real downloadable PDF." accentColor="hsl(217, 70%, 50%)" icon={<FileText className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={handleFiles} accept=".docx" label="Drop a Word document here" sublabel=".docx files supported" />
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>Choose different file</Button>
            </CardContent>
          </Card>
          {processing && (
            <div className="space-y-1.5">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">Converting… {progress}%</p>
            </div>
          )}
          <Button onClick={handleConvert} disabled={processing} className="w-full min-h-[44px]" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Converting…" : "Convert & Download PDF"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default WordToPdfPage;
