import { useCallback, useState, useRef } from "react";
import { Upload, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  label = "Drop PDF files here",
  sublabel = "or click to browse",
  className,
}: FileDropZoneProps) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onDragOver={(e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300",
        dragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/40",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={dragging ? "drop" : "idle"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
        >
          {dragging ? (
            <FileUp className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
        </motion.div>
      </AnimatePresence>
      <p className="text-lg font-semibold">{dragging ? "Drop it!" : label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{sublabel}</p>
      <p className="mt-3 text-xs text-muted-foreground/60">Supports: PDF files</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
    </motion.div>
  );
};

export default FileDropZone;
