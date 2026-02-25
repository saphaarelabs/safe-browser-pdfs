import { useCallback, useState, useRef } from "react";
import { Upload, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
}

const FileDropZone = ({
  onFiles,
  accept = ".pdf",
  multiple = false,
  label = "Drop files here",
  sublabel = "or click to browse",
  className,
}: FileDropZoneProps) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isImageAccept = accept.includes("image") || accept.match(/\.(png|jpg|jpeg|webp|gif|bmp)/);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        accept.split(",").some((ext) => f.name.toLowerCase().endsWith(ext.trim()))
      );
      if (files.length) onFiles(files);
    },
    [accept, onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length) onFiles(files);
      e.target.value = "";
    },
    [onFiles]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors min-h-[120px]",
        dragging
          ? "border-foreground/30 bg-secondary"
          : "border-border hover:border-foreground/20 hover:bg-secondary/50",
        className
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <Upload className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium">{dragging ? "Drop it!" : label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
      {isImageAccept && (
        <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
          <Camera className="h-3 w-3" /> Camera capture supported on mobile
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        capture={isImageAccept ? "environment" : undefined}
      />
    </div>
  );
};

export default FileDropZone;
