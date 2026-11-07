import { ChangeEvent, useEffect, useState } from "react";

export default function ArtworkUploader({ value, onChange }: { value: string | null; onChange: (file: File | null) => void }) {
  const [preview, setPreview] = useState(value);
  useEffect(() => setPreview(value), [value]);
  function choose(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; onChange(file); setPreview(URL.createObjectURL(file)); }
  return <div className="uploader"><div className="upload-preview">{preview ? <img src={preview} alt="Artwork preview" /> : <span>No artwork yet</span>}</div><label className="quiet-button upload-label">Choose image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={choose} /></label><span className="muted">PNG, JPG or WebP · max 10MB</span></div>;
}
