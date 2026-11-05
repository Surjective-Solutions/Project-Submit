import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { checkPhotoFile } from '@/student-registration/utils';
import styles from './registration.module.css';

// Profile picture row. `photo` is { dataUrl, file } or null. The preview is a data URL read with
// FileReader; the file itself is uploaded when the student is registered.
export default function PhotoUploader({ photo, initials, onChange }) {
  const inputRef = useRef(null);
  const readToken = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => {
    readToken.current += 1; // ignore a read that finishes after unmount
  }, []);

  function accept(file) {
    if (!file) return;
    const problem = checkPhotoFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    const token = (readToken.current += 1);
    const reader = new FileReader();
    reader.onload = () => {
      if (token === readToken.current) onChange({ dataUrl: reader.result, file });
    };
    reader.onerror = () => {
      if (token === readToken.current) setError('Could not read that file. Try another photo.');
    };
    reader.readAsDataURL(file);
  }

  function handleInput(e) {
    accept(e.target.files?.[0]);
    e.target.value = ''; // lets the same file be picked again after a Remove
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer?.files?.[0]);
  }

  function remove() {
    readToken.current += 1;
    setError('');
    onChange(null);
  }

  const circleClass = [styles.photoCircle, photo ? styles.photoCircleSet : '', dragging ? styles.photoCircleDrag : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.photoRow}>
      <div
        className={circleClass}
        style={photo ? { backgroundImage: `url(${photo.dataUrl})` } : undefined}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        data-testid="photo-circle"
        role={photo ? 'img' : undefined}
        aria-label={photo ? 'Profile photo preview' : undefined}
      >
        {!photo && (initials ? <span aria-hidden="true">{initials}</span> : <Icon name="person" size={34} />)}
      </div>

      <div className={styles.photoBody}>
        <p className={styles.label} id="reg-photo-label">
          Profile picture (optional)
        </p>
        <div className={styles.photoActions}>
          <input
            ref={inputRef}
            id="reg-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.hiddenInput}
            onChange={handleInput}
            aria-labelledby="reg-photo-label"
            tabIndex={-1}
          />
          <button type="button" className={styles.secondaryButton} onClick={() => inputRef.current?.click()}>
            <Icon name="upload" size={18} />
            {photo ? 'Replace photo' : 'Upload photo'}
          </button>
          {photo && (
            <button type="button" className={styles.removeButton} onClick={remove}>
              Remove
            </button>
          )}
        </div>
        <p className={styles.hint}>Square photo · JPG, PNG or WebP · under 2 MB. You can also drag it onto the circle.</p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
