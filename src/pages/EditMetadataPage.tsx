import { useState, useCallback } from "react";
import { FileEdit, Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { toast } from "sonner";

const EditMetadataPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setTitle(pdf.getTitle() || "");
      setAuthor(pdf.getAuthor() || "");
      setSubject(pdf.getSubject() || "");
      setKeywords(pdf.getKeywords() || "");
    } catch {
      toast.error("Could not read this PDF.");
    }
  }, []);

  const handleSave = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      pdf.setTitle(title);
      pdf.setAuthor(author);
      pdf.setSubject(subject);
      pdf.setKeywords([keywords]);
      pdf.setProducer("PDF Tools — https://safe-browser-pdfs.lovable.app");
      pdf.setModificationDate(new Date());

      const bytes = await pdf.save();
      saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), `edited-${file.name}`);
      toast.success("Metadata updated!");
    } catch (err) {
      toast.error("Failed to update metadata.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="Edit Metadata"
      description="Change title, author, subject, and keywords"
      accentColor="hsl(270, 50%, 50%)"
      icon={<FileEdit className="h-5 w-5" />}
    >
      {!file ? (
        <FileDropZone onFiles={handleFiles} label="Drop a PDF file here" />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{file.name}</p>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setFile(null)}>
              Change file
            </Button>
          </div>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Author</Label>
                <Input value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Keywords</Label>
                <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="comma, separated" className="mt-1" />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={processing} className="w-full" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {processing ? "Saving…" : "Save & Download"}
          </Button>
        </>
      )}
    </ToolPageLayout>
  );
};

export default EditMetadataPage;
