'use client';

import { useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { COVER_TYPES } from '@/study-packs/constants';
import { coverFileError } from '@/study-packs/utils';
import styles from './study-packs.module.css';

// Drop zone for the cover image. Checks type and size before handing the file up.
// `coverUrl` is whatever should be previewed (an existing cover or the file just picked).
export default function CoverUploader({ coverUrl, onSelect, onRemove }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  function openPicker() {
    inputRef.current?.click();
  }

  function handleFile(file) {
    if (!file) return;
    const problem = coverFileError(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    onSelect(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer?.files?.[0]);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  }

  return (
    <div className={styles.coverUploader}>
      <input
        ref={inputRef}
        type="file"
        accept={COVER_TYPES.join(',')}
        className={styles.srOnly}
        tabIndex={-1}
        aria-label="Choose a cover image"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = ''; // so picking the same file again still fires
        }}
      />

      {coverUrl ? (
        <>
          <div
            className={styles.coverPreview}
            style={{ backgroundImage: `url(${JSON.stringify(coverUrl)})` }}
            role="img"
            aria-label="Cover image preview"
          />
          <div className={styles.coverActions}>
            <button type="button" className={styles.smallSecondaryButton} onClick={openPicker}>
              <Icon name="swap_horiz" size={17} weight={600} />
              Replace
            </button>
            <button type="button" className={styles.smallDangerButton} onClick={onRemove}>
              <Icon name="delete" size={17} weight={600} />
              Remove
            </button>
          </div>
        </>
      ) : (
        <div
          className={dragging ? `${styles.dropzone} ${styles.dropzoneActive}` : styles.dropzone}
          role="button"
          tabIndex={0}
          aria-label="Add a cover image: drag a file here or press Enter to browse"
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <span className={styles.dropzoneIcon} aria-hidden="true">
            <Icon name="add_photo_alternate" size={32} />
          </span>
          <span className={styles.dropzoneTitle}>
            Drag an image here or <span className={styles.dropzoneLink}>browse</span>
          </span>
          <span className={styles.dropzoneHint}>16:9 · JPG, PNG or WebP · under 2 MB</span>
        </div>
      )}

      {error ? (
        <p className={styles.coverError} role="alert">
          <Icon name="error" size={17} fill={1} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
