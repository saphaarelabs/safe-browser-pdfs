import { useState } from "react";
import { GitCompare } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function extractText(file: File): Promise<string[]> {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item: any) => item.str).join(" "));
  }
  return pages;
}

interface DiffLine { type: "same" | "added" | "removed"; text: string }

function diffLines(a: string[], b: string[]): DiffLine[] {
  const result: DiffLine[] = [];
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    const lineA = a[i] || "";
    const lineB = b[i] || "";
    if (lineA === lineB) {
      result.push({ type: "same", text: lineA });
    } else {
      if (lineA) result.push({ type: "removed", text: lineA });
      if (lineB) result.push({ type: "added", text: lineB });
    }
  }
  return result;
}

const PdfDiffPage = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [diff, setDiff] = useState<DiffLine[] | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleDiff = async () => {
    if (!file1 || !file2) return;
    setProcessing(true);
    try {
      const [text1, text2] = await Promise.all([extractText(file1), extractText(file2)]);
      setDiff(diffLines(text1, text2));
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout title="PDF Diff" description="Compare text content of two PDFs side by side." accentColor="hsl(35, 70%, 50%)" icon={<GitCompare className="h-5 w-5" />}>
      {!diff ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">First PDF</label>
            {!file1 ? (
              <FileDropZone onFiles={(f) => setFile1(f[0])} accept=".pdf" label="Drop first PDF" className="py-8" />
            ) : (
              <p className="text-sm text-muted-foreground">{file1.name} <button className="underline ml-2" onClick={() => setFile1(null)}>change</button></p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Second PDF</label>
            {!file2 ? (
              <FileDropZone onFiles={(f) => setFile2(f[0])} accept=".pdf" label="Drop second PDF" className="py-8" />
            ) : (
              <p className="text-sm text-muted-foreground">{file2.name} <button className="underline ml-2" onClick={() => setFile2(null)}>change</button></p>
            )}
          </div>
          <Button onClick={handleDiff} disabled={!file1 || !file2 || processing}>{processing ? "Comparing…" : "Compare"}</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border overflow-hidden max-h-[500px] overflow-y-auto">
            {diff.map((line, i) => (
              <div
                key={i}
                className={`px-4 py-1.5 text-xs font-mono border-b last:border-0 ${
                  line.type === "added" ? "bg-green-500/10 text-green-700 dark:text-green-400" :
                  line.type === "removed" ? "bg-red-500/10 text-red-700 dark:text-red-400" : ""
                }`}
              >
                <span className="mr-2 text-muted-foreground">{line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}</span>
                {line.text || <span className="text-muted-foreground italic">empty page</span>}
              </div>
            ))}
          </div>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/20" /> Added</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/20" /> Removed</span>
          </div>
          <Button variant="outline" onClick={() => { setFile1(null); setFile2(null); setDiff(null); }}>Start Over</Button>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default PdfDiffPage;
