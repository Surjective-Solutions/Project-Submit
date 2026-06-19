'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

function Initials({ name }) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const letters =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return letters.toUpperCase();
}

export default function AvatarUpload({
  name = '',
  initialUrl = null,
  onChange,
  size = 80,
}) {
  const [preview, setPreview] = useState(initialUrl);
  const [objectUrl, setObjectUrl] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    setPreview(initialUrl);
  }, [initialUrl]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setPreview(url);
    onChange?.(file, url);
    e.target.value = '';
  }

  function handleRemove(e) {
    e.stopPropagation();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
    setPreview(null);
    onChange?.(null, null);
  }

  const fontSize = Math.round(size * 0.28);
  const iconSize = Math.round(size * 0.3);
  const removeSize = Math.max(18, Math.round(size * 0.22));

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-full rounded-full overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary block"
          aria-label="Upload profile picture"
          style={{ width: size, height: size }}
        >
          {preview ? (
            <img
              src={preview}
              alt={name || 'Profile'}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-bold text-white select-none rounded-full"
              style={{
                background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)',
                fontSize,
              }}
            >
              <Initials name={name} />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 rounded-full bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Camera style={{ width: iconSize, height: iconSize }} className="text-white" />
          </div>
        </button>

        {/* Remove button */}
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove photo"
            className="absolute -top-0.5 -right-0.5 rounded-full bg-destructive text-white flex items-center justify-center shadow hover:brightness-90 transition-all"
            style={{ width: removeSize, height: removeSize }}
          >
            <X style={{ width: removeSize * 0.5, height: removeSize * 0.5 }} />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        {preview ? 'Change photo' : 'Upload photo'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleFileChange}
        tabIndex={-1}
      />
    </div>
  );
}
