import { useCallback, useRef, useState } from "react";

export default function FileDrop({ onFile }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((files) => {
    if (!files || !files.length) return;
    const file = files[0];
    if (!/\.(mp3|wav|ogg|m4a)$/i.test(file.name)) {
      alert("Please upload an audio file (MP3, WAV, OGG, M4A)");
      return;
    }
    onFile(file);
  }, [onFile]);

  return (
    <div
      className={`panel p-6 text-center cursor-pointer border-dashed ${dragOver ? "border-accent" : "border-white/20"}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="text-2xl font-semibold text-accent">Drop audio here or click to upload</div>
      <div className="text-white/60 mt-2">MP3, WAV, OGG, M4A up to ~20MB</div>
    </div>
  );
}
