"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";

type ScreenshotUploadProps = {
  onScan: (files: File[]) => Promise<void>;
  isScanning: boolean;
  error?: string | null;
  maxFiles?: number;
};

export function ScreenshotUpload({
  onScan,
  isScanning,
  error,
  maxFiles = 2,
}: ScreenshotUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const objectUrls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => {
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [objectUrls]);

  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const added = Array.from(incoming).slice(0, maxFiles - files.length);
      if (added.length === 0) return;
      setFiles((prev) => [...prev, ...added].slice(0, maxFiles));
    },
    [files.length, maxFiles],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleScan = useCallback(async () => {
    if (files.length === 0 || isScanning) return;
    await onScan(files);
  }, [files, isScanning, onScan]);

  return (
    <div className="space-y-3">
      {/* Upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={files.length >= maxFiles || isScanning}
        className="flex w-full min-h-11 items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm font-semibold text-muted-foreground transition-all active:scale-[0.98] disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        Upload GO Screenshots ({files.length}/{maxFiles})
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Thumbnails */}
      {files.length > 0 && (
        <div className="flex gap-2">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="relative">
              <img
                src={objectUrls[i]}
                alt={file.name}
                className="h-20 w-20 rounded object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                disabled={isScanning}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Scan button */}
      {files.length > 0 && (
        <button
          type="button"
          onClick={handleScan}
          disabled={isScanning}
          className="flex w-full min-h-11 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            "Scan My Pokemon"
          )}
        </button>
      )}

      {/* Error */}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
