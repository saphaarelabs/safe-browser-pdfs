import { useState } from "react";
import { Code, Download } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ToolPageLayout from "@/components/ToolPageLayout";
import { toast } from "sonner";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const LINE_HEIGHT = 16;

const defaultHtml = `<!DOCTYPE html>
<html>
<head><title>My Document</title></head>
<body>
  <h1>Hello World</h1>
  <p>This HTML will be converted to a real downloadable PDF using pdf-lib.</p>
  <h2>Features</h2>
  <ul>
    <li>No popups or print dialogs</li>
    <li>Direct PDF download</li>
    <li>Proper text rendering</li>
  </ul>
  <p>This is a paragraph with some longer text that will be wrapped automatically to fit within the page margins of the generated PDF document.</p>
</body>
</html>`;

interface Block { type: "h1" | "h2" | "p" | "li"; text: string; }

function htmlToBlocks(html: string): Block[] {
  const blocks: Block[] = [];
  // Use DOMParser to avoid innerHTML resource-loading side effects (XSS mitigation)
  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, "text/html");
  const div = parsed.body ?? parsed.documentElement;

  function walk(el: Element) {
    const tag = el.tagName?.toLowerCase();
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
      blocks.push({ type: tag === "h1" ? "h1" : "h2", text: el.textContent?.trim() || "" });
    } else if (tag === "li") {
      blocks.push({ type: "li", text: `• ${el.textContent?.trim() || ""}` });
    } else if (tag === "p" || tag === "div" || tag === "td" || tag === "th" || tag === "blockquote") {
      const t = el.textContent?.trim();
      if (t) blocks.push({ type: "p", text: t });
    } else {
      for (const child of Array.from(el.children)) walk(child);
      if (el.children.length === 0 && el.textContent?.trim()) {
        blocks.push({ type: "p", text: el.textContent.trim() });
      }
    }
  }
  // Try to parse body content first
  const body = div.querySelector("body");
  const root = body || div;
  for (const child of Array.from(root.children)) walk(child);
  if (blocks.length === 0 && root.textContent?.trim()) {
    blocks.push({ type: "p", text: root.textContent.trim() });
  }
  return blocks;
}

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

const HtmlToPdfPage = () => {
  const [html, setHtml] = useState(defaultHtml);
  const [processing, setProcessing] = useState(false);

  const handleConvert = async () => {
    if (!html.trim()) return;
    setProcessing(true);
    try {
      const blocks = htmlToBlocks(html);
      const pdf = await PDFDocument.create();
      const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const maxWidth = PAGE_W - MARGIN * 2;

      let page = pdf.addPage([PAGE_W, PAGE_H]);
      let y = PAGE_H - MARGIN;

      for (const block of blocks) {
        if (!block.text) continue;
        const isHeading = block.type === "h1" || block.type === "h2";
        const fontSize = block.type === "h1" ? 20 : block.type === "h2" ? 16 : 11;
        const font = isHeading ? fontBold : fontRegular;
        const lineH = isHeading ? fontSize * 1.5 : LINE_HEIGHT;

        const lines = wrapText(block.text, font, fontSize, maxWidth);
        for (const line of lines) {
          if (y < MARGIN + lineH) { page = pdf.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
          page.drawText(line, { x: MARGIN + (block.type === "li" ? 10 : 0), y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
          y -= lineH;
        }
        if (isHeading) y -= 6;
        y -= 4;
      }

      const pdfBytes = await pdf.save();
      saveAs(new Blob([pdfBytes as BlobPart], { type: "application/pdf" }), "html-output.pdf");
      toast.success("HTML converted to PDF!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to convert.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="HTML to PDF" description="Convert HTML code to a real downloadable PDF document." accentColor="hsl(250, 60%, 55%)" icon={<Code className="h-5 w-5" />}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Label className="font-semibold">Paste your HTML</Label>
          <Textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={14} className="font-mono text-xs" placeholder="<html>...</html>" />
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Button onClick={handleConvert} className="flex-1 min-h-[44px]" size="lg" disabled={!html.trim() || processing}>
          <Download className="mr-2 h-4 w-4" />
          {processing ? "Converting…" : "Convert & Download PDF"}
        </Button>
      </div>
    </ToolPageLayout>
  );
};

export default HtmlToPdfPage;
