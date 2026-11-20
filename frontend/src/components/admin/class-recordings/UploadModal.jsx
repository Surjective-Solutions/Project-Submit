'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import {
  copyText,
  formatBytes,
  formatDuration,
  readVideoDuration,
  titleFromFileName,
  videoFileError,
} from '@/class-recordings/utils';
import { recordingTitleError } from '@/class-recordings/validators';
import Modal from './Modal';
import styles from './classRecordings.module.css';

// Upload a recording into the open folder. Three steps in one dialog: the form, the upload itself (with progress and
// a way to cancel), and a "done" screen with the new code and share link.
//   onUploaded(recording) is called as soon as the upload finishes, so the list can show it.
//   onUpload(payload, { onProgress, signal }) does the upload (the library's API).
//   onToast(message) shows "Code copied" / "Link copied".
export default function UploadModal({ tutor, folderId, pathLabel, onUpload, onUploaded, onToast, onClose }) {
  const ids = useId();
  const fileInput = useRef(null);
  const controller = useRef(null);

  const [stage, setStage] = useState('form'); // 'form' | 'uploading' | 'done'
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(null);
  const [errors, setErrors] = useState({ title: '', file: '', submit: '' });
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 1 });
  const [result, setResult] = useState(null);

  // leaving the dialog any other way never leaves an upload running
  useEffect(() => () => controller.current?.abort(), []);

  async function chooseFile(picked) {
    if (!picked) return;
    const problem = videoFileError(picked);
    if (problem) {
      setErrors((e) => ({ ...e, file: problem, submit: '' }));
      return;
    }
    setFile(picked);
    setDuration(null);
    setErrors((e) => ({ ...e, file: '', submit: '' }));
    setTitle((current) => (current.trim() ? current : titleFromFileName(picked.name)));
    setErrors((e) => ({ ...e, title: '' }));
    setDuration(await readVideoDuration(picked));
  }

  async function submit(event) {
    event.preventDefault();
    const finalTitle = title.trim() || (file ? titleFromFileName(file.name) : '');
    const next = {
      title: recordingTitleError(finalTitle),
      file: videoFileError(file),
      submit: '',
    };
    setErrors(next);
    if (next.title || next.file) return;

    setTitle(finalTitle);
    setStage('uploading');
    setProgress({ loaded: 0, total: file.size || 1 });
    controller.current = new AbortController();
    try {
      const recording = await onUpload(
        { tutorId: tutor.id, folderId, title: finalTitle, file, durationSec: duration ?? 0 },
        { onProgress: setProgress, signal: controller.current.signal }
      );
      setResult(recording);
      onUploaded(recording);
      setStage('done');
    } catch (err) {
      setStage('form');
      if (err?.name !== 'AbortError') {
        setErrors((e) => ({ ...e, submit: err?.message || 'The upload failed. Please try again.' }));
      }
    } finally {
      controller.current = null;
    }
  }

  function uploadAnother() {
    setTitle('');
    setFile(null);
    setDuration(null);
    setResult(null);
    setErrors({ title: '', file: '', submit: '' });
    setStage('form');
  }

  async function copy(text, message) {
    if (await copyText(text)) onToast(message);
  }

  const percent = Math.min(100, Math.round((progress.loaded / progress.total) * 100));

  // ── Done ──
  if (stage === 'done' && result) {
    return (
      <Modal
        title="Upload recording"
        onClose={onClose}
        footer={
          <>
            <button type="button" className={styles.btnSecondary} onClick={uploadAnother}>
              Upload another
            </button>
            <button type="button" className={styles.btnPrimary} onClick={onClose}>
              Done
            </button>
          </>
        }
      >
        <div className={styles.doneWrap}>
          <span className={styles.doneIcon}>
            <Icon name="check" size={30} weight={700} />
          </span>
          <h3 className={styles.doneTitle}>Recording uploaded</h3>
          <p className={styles.doneSub}>
            {result.title} · saved in {pathLabel}
          </p>
          <span className={styles.bigCode} data-testid="new-code">
            {result.code}
          </span>
          <button type="button" className={styles.btnSecondary} onClick={() => copy(result.code, 'Code copied')}>
            <Icon name="content_copy" size={18} />
            Copy code
          </button>
          <div className={styles.linkRow}>
            <input className={styles.input} readOnly value={result.shareUrl} aria-label="Share link" />
            <button type="button" className={styles.btnSecondary} onClick={() => copy(result.shareUrl, 'Link copied')}>
              <Icon name="link" size={18} />
              Copy link
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // ── Uploading ──
  if (stage === 'uploading') {
    return (
      <Modal
        title="Uploading…"
        onClose={onClose}
        dismissible={false}
        footer={
          <button type="button" className={styles.btnSecondary} onClick={() => controller.current?.abort()}>
            Cancel upload
          </button>
        }
      >
        <div className={styles.progressWrap}>
          <p className={styles.fileName}>{title}</p>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Upload progress"
          >
            <div className={styles.progressBar} style={{ width: `${percent}%` }} />
          </div>
          <p className={styles.progressText}>
            {percent}% · {formatBytes(progress.loaded)} of {formatBytes(progress.total)} · keep this window open
          </p>
        </div>
      </Modal>
    );
  }

  // ── Form ──
  return (
    <Modal
      title="Upload recording"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form={`${ids}-form`} className={styles.btnPrimary}>
            <Icon name="upload" size={18} weight={600} />
            Upload
          </button>
        </>
      }
    >
      <form id={`${ids}-form`} onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className={styles.strip}>Saving to {pathLabel}</div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${ids}-title`}>
            Recording title *
          </label>
          <input
            id={`${ids}-title`}
            className={errors.title ? `${styles.input} ${styles.inputInvalid}` : styles.input}
            value={title}
            maxLength={200}
            placeholder="e.g. Electric fields"
            aria-invalid={errors.title ? 'true' : undefined}
            onChange={(event) => {
              setTitle(event.target.value);
              if (errors.title) setErrors((e) => ({ ...e, title: '' }));
            }}
          />
          {errors.title ? (
            <p className={styles.errorText} role="alert">
              {errors.title}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <span className={styles.label} id={`${ids}-file-label`}>
            Video file *
          </span>
          <input
            ref={fileInput}
            type="file"
            hidden
            accept="video/*,.mp4,.mov,.mkv,.webm"
            aria-labelledby={`${ids}-file-label`}
            data-testid="video-input"
            onChange={(event) => {
              chooseFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          {file ? (
            <div className={styles.fileCard}>
              <span className={styles.folderIcon} style={{ background: 'var(--soft)', color: 'var(--navy)' }}>
                <Icon name="video_file" size={24} />
              </span>
              <div className={styles.fileInfo}>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileMeta}>
                  {formatBytes(file.size)}
                  {duration ? ` · ${formatDuration(duration)}` : ''}
                </p>
              </div>
              <button type="button" className={styles.btnSecondary} style={{ height: 36 }} onClick={() => fileInput.current?.click()}>
                Change
              </button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              aria-labelledby={`${ids}-file-label`}
              className={[
                styles.dropzone,
                dragging ? styles.dropzoneActive : '',
                errors.file ? styles.dropzoneInvalid : '',
              ].join(' ')}
              onClick={() => fileInput.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  fileInput.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                chooseFile(event.dataTransfer.files?.[0]);
              }}
            >
              <Icon name="cloud_upload" size={32} style={{ color: 'var(--navy)' }} />
              <span>
                Drop a video here or <span className={styles.browse}>browse</span>
              </span>
              <span className={styles.dropHint}>MP4, MOV, MKV or WebM · up to 10 GB</span>
            </div>
          )}
          {errors.file ? (
            <p className={styles.errorText} role="alert">
              {errors.file}
            </p>
          ) : null}
        </div>

        {errors.submit ? (
          <p className={styles.errorText} role="alert">
            {errors.submit}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
