import { useState } from "react";
import { Binary } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ImageToBase64Page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState("");
  const [preview, setPreview] = useState("");

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64(result);
      setPreview(result);
    };
    reader.readAsDataURL(f);
  };

  return (
    <ToolPageLayout title="Image to Base64" description="Convert an image file to a Base64-encoded string." accentColor="hsl(270, 55%, 55%)" icon={<Binary className="h-5 w-5" />}>
      {!file ? (
        <FileDropZone onFiles={(f) => handleFile(f[0])} accept=".png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,.ico" label="Drop an image here" />
      ) : (
        <div className="space-y-4">
          {preview && <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-md border" />}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Base64 Data URL</label>
            <Textarea value={base64} readOnly rows={8} className="font-mono text-xs break-all" />
          </div>
          <p className="text-xs text-muted-foreground">{(base64.length / 1024).toFixed(1)} KB encoded length</p>
          <div className="flex gap-2">
            <Button onClick={() => navigator.clipboard.writeText(base64)}>Copy to Clipboard</Button>
            <Button variant="outline" onClick={() => { setFile(null); setBase64(""); setPreview(""); }}>Clear</Button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default ImageToBase64Page;
