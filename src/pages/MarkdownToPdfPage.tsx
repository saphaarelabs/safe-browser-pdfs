import { useState } from "react";
import { FileDown, Download } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const LINE_HEIGHT = 16;

interface Block { type: "h1" | "h2" | "h3" | "p" | "li" | "hr" | "blank"; text: string; }

function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = [];
  for (const line of md.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) { blocks.push({ type: "blank", text: "" }); continue; }
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) { blocks.push({ type: "hr", text: "" }); continue; }
    if (trimmed.startsWith("### ")) { blocks.push({ type: "h3", text: trimmed.slice(4) }); continue; }
    if (trimmed.startsWith("## ")) { blocks.push({ type: "h2", text: trimmed.slice(3) }); continue; }
    if (trimmed.startsWith("# ")) { blocks.push({ type: "h1", text: trimmed.slice(2) }); continue; }
    if (/^[-*+] /.test(trimmed)) { blocks.push({ type: "li", text: `• ${trimmed.slice(2)}` }); continue; }
    if (/^\d+\. /.test(trimmed)) { blocks.push({ type: "li", text: trimmed }); continue; }
    // Strip bold/italic markers for plain text rendering
    const clean = trimmed.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/__(.+?)__/g, "$1").replace(/_(.+?)_/g, "$1").replace(/`(.+?)`/g, "$1");
    blocks.push({ type: "p", text: clean });
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

const MarkdownToPdfPage = () => {
  const [md, setMd] = useState("# Hello World\n\nThis is a **Markdown** document.\n\n- Item 1\n- Item 2\n- Item 3\n\n## Section Two\n\nSome more text here with `inline code` and *emphasis*.\n\n---\n\n### Sub-section\n\n1. First item\n2. Second item");
  const [processing, setProcessing] = useState(false);

  const handleConvert = async () => {
    if (!md.trim()) return;
    setProcessing(true);
    try {
      const blocks = parseMarkdown(md);
      const pdf = await PDFDocument.create();
      const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const maxWidth = PAGE_W - MARGIN * 2;

      let page = pdf.addPage([PAGE_W, PAGE_H]);
      let y = PAGE_H - MARGIN;

      for (const block of blocks) {
        if (block.type === "blank") { y -= 8; continue; }
        if (block.type === "hr") {
          if (y < MARGIN + 20) { page = pdf.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
          y -= 10;
          page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
          y -= 10;
          continue;
        }

        const isH1 = block.type === "h1";
        const isH2 = block.type === "h2";
        const isH3 = block.type === "h3";
        const isHeading = isH1 || isH2 || isH3;
        const fontSize = isH1 ? 20 : isH2 ? 16 : isH3 ? 13 : 11;
        const font = isHeading ? fontBold : fontRegular;
        const lineH = isHeading ? fontSize * 1.5 : LINE_HEIGHT;

        const lines = wrapText(block.text, font, fontSize, maxWidth);
        for (const line of lines) {
          if (y < MARGIN + lineH) { page = pdf.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN; }
          page.drawText(line, { x: MARGIN + (block.type === "li" ? 10 : 0), y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
          y -= lineH;
        }
        if (isHeading) y -= 4;
        y -= 2;
      }

      const pdfBytes = await pdf.save();
      saveAs(new Blob([pdfBytes as BlobPart], { type: "application/pdf" }), "markdown-output.pdf");
      toast.success("Markdown converted to PDF!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to convert.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="Markdown to PDF" description="Convert Markdown text to a real downloadable PDF document." accentColor="hsl(250, 60%, 55%)" icon={<FileDown className="h-5 w-5" />}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Label className="font-semibold">Paste or write your Markdown</Label>
          <Textarea value={md} onChange={(e) => setMd(e.target.value)} rows={14} className="font-mono text-xs" />
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Button onClick={handleConvert} disabled={!md.trim() || processing} className="flex-1 min-h-[44px]" size="lg">
          <Download className="mr-2 h-4 w-4" />
          {processing ? "Converting…" : "Convert & Download PDF"}
        </Button>
        <Button variant="outline" onClick={() => setMd("")} className="min-h-[44px]" size="lg">Clear</Button>
      </div>
    </ToolPageLayout>
  );
};

export default MarkdownToPdfPage;
