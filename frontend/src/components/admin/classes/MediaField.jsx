'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { formatSize } from '@/classes/classUtils';
import styles from './classes.module.css';
import s from './sessions.module.css';

// An optional picture or video for the class (the banner or the trailer).
// value: { url, name, file, removed }. url is the stored file or the preview of a newly chosen one.
// `check(file)` returns an error message, or '' when the file is fine. `accept` is the file picker filter.
export default function MediaField({ id, kind, label, hint, accept, value, check, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const previewUrl = useRef('');

  // A preview made for a chosen file is released when it is replaced or the dialog closes.
  useEffect(
    () => () => {
      if (previewUrl.current && typeof URL !== 'undefined' && URL.revokeObjectURL) URL.revokeObjectURL(previewUrl.current);
    },
    [],
  );

  function release() {
    if (previewUrl.current && typeof URL !== 'undefined' && URL.revokeObjectURL) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = '';
  }

  function pick(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = check(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    release();
    const url = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : '';
    previewUrl.current = url;
    onChange({ url, name: file.name, file, removed: false });
  }

  function remove() {
    setError('');
    release();
    onChange({ url: '', name: '', file: null, removed: true });
  }

  const has = !!(value.url || value.file) && !value.removed;

  return (
    <div className={styles.field}>
      <span className={styles.label} id={`${id}-label`}>
        {label}
      </span>
      <div className={s.media}>
        {has && (
          <div className={s.mediaPreview}>
            {kind === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.url} alt="" className={s.mediaImage} />
            ) : value.url && value.url !== '#' ? (
              <video src={value.url} className={s.mediaVideo} controls preload="metadata" aria-label={`${label} preview`} />
            ) : (
              <span className={s.mediaVideoPlaceholder}>
                <Icon name="movie" size={28} weight={400} />
              </span>
            )}
          </div>
        )}
        <div className={s.mediaBody}>
          <p className={s.mediaName} data-testid={`${id}-name`}>
            {has ? value.name || 'Chosen file' : 'Not added'}
            {has && value.file && <span className={s.mediaSize}> · {formatSize(value.file.size)}</span>}
          </p>
          <div className={s.mediaButtons}>
            <button type="button" className={styles.secondaryButton} onClick={() => inputRef.current?.click()} aria-describedby={`${id}-label`}>
              <Icon name={has ? 'swap_horiz' : 'upload'} size={18} weight={600} />
              {has ? 'Replace' : 'Choose file'}
            </button>
            {has && (
              <button type="button" className={s.clearLink} onClick={remove}>
                Remove
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            className={s.srOnly}
            tabIndex={-1}
            aria-labelledby={`${id}-label`}
            onChange={pick}
          />
        </div>
      </div>
      {error ? (
        <p className={s.fieldError} role="alert">
          {error}
        </p>
      ) : (
        hint && <p className={s.hint}>{hint}</p>
      )}
    </div>
  );
}
