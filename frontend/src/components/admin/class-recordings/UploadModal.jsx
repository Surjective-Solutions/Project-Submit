'use client';

import { useId, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { copyText } from '@/class-recordings/utils';
import { recordingTitleError } from '@/class-recordings/validators';
import Modal from './Modal';
import styles from './classRecordings.module.css';

const DURATION_MAX_MINS = 24 * 60;

// Add a recording record. Nothing is uploaded: the dialog collects the details of a recording, the server saves them and
// makes a recording code, and a "done" screen shows the new code so it can be used in a study pack.
//   onUpload(payload) saves the record (the library's API) and resolves with the saved recording.
//   onUploaded(recording) is called as soon as it is saved, so the list can show it.
//   onToast(message) shows "Code copied" / "Link copied".
export default function UploadModal({ tutor, folderId, pathLabel, onUpload, onUploaded, onToast, onClose }) {
  const ids = useId();

  const [stage, setStage] = useState('form'); // 'form' | 'saving' | 'done'
  const [title, setTitle] = useState('');
  const [classDate, setClassDate] = useState('');
  const [minutes, setMinutes] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [errors, setErrors] = useState({ title: '', minutes: '', videoUrl: '', submit: '' });
  const [result, setResult] = useState(null);

  const clear = (field) => errors[field] && setErrors((e) => ({ ...e, [field]: '', submit: '' }));

  async function submit(event) {
    event.preventDefault();
    const mins = minutes === '' ? null : Number(minutes);
    const next = {
      title: recordingTitleError(title),
      minutes:
        mins !== null && (!Number.isInteger(mins) || mins < 0 || mins > DURATION_MAX_MINS)
          ? `Enter whole minutes from 0 to ${DURATION_MAX_MINS}.`
          : '',
      videoUrl: videoUrl.trim() && !/^https?:\/\/\S+$/.test(videoUrl.trim()) ? 'The link must start with http:// or https://.' : '',
      submit: '',
    };
    setErrors(next);
    if (next.title || next.minutes || next.videoUrl) return;

    setStage('saving');
    try {
      const recording = await onUpload({
        tutorId: tutor.id,
        folderId,
        title: title.trim(),
        classDate: classDate || undefined,
        durationSec: (mins ?? 0) * 60,
        videoUrl: videoUrl.trim() || undefined,
      });
      setResult(recording);
      onUploaded(recording);
      setStage('done');
    } catch (err) {
      setStage('form');
      setErrors((e) => ({ ...e, submit: err?.message || 'The recording could not be saved. Please try again.' }));
    }
  }

  function addAnother() {
    setTitle('');
    setClassDate('');
    setMinutes('');
    setVideoUrl('');
    setResult(null);
    setErrors({ title: '', minutes: '', videoUrl: '', submit: '' });
    setStage('form');
  }

  async function copy(text, message) {
    if (await copyText(text)) onToast(message);
  }

  // ── Done ──
  if (stage === 'done' && result) {
    return (
      <Modal
        title="Add recording"
        onClose={onClose}
        footer={
          <>
            <button type="button" className={styles.btnSecondary} onClick={addAnother}>
              Add another
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
          <h3 className={styles.doneTitle}>Recording saved</h3>
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
          {result.videoUrl ? (
            <div className={styles.linkRow}>
              <input className={styles.input} readOnly value={result.shareUrl} aria-label="Video link" />
              <button type="button" className={styles.btnSecondary} onClick={() => copy(result.shareUrl, 'Link copied')}>
                <Icon name="link" size={18} />
                Copy link
              </button>
            </div>
          ) : null}
        </div>
      </Modal>
    );
  }

  const saving = stage === 'saving';
  const inputClass = (field) => (errors[field] ? `${styles.input} ${styles.inputInvalid}` : styles.input);

  // ── Form ──
  return (
    <Modal
      title="Add recording"
      onClose={onClose}
      dismissible={!saving}
      footer={
        <>
          <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form={`${ids}-form`} className={styles.btnPrimary} disabled={saving}>
            <Icon name="check" size={18} weight={600} />
            {saving ? 'Saving…' : 'Save recording'}
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
            className={inputClass('title')}
            value={title}
            maxLength={200}
            placeholder="e.g. Electric fields"
            aria-invalid={errors.title ? 'true' : undefined}
            onChange={(event) => {
              setTitle(event.target.value);
              clear('title');
            }}
          />
          {errors.title ? (
            <p className={styles.errorText} role="alert">
              {errors.title}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${ids}-date`}>
            Class date
          </label>
          <input
            id={`${ids}-date`}
            type="date"
            className={styles.input}
            value={classDate}
            onChange={(event) => setClassDate(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${ids}-minutes`}>
            Length (minutes)
          </label>
          <input
            id={`${ids}-minutes`}
            type="number"
            min={0}
            max={DURATION_MAX_MINS}
            inputMode="numeric"
            className={inputClass('minutes')}
            value={minutes}
            placeholder="e.g. 90"
            aria-invalid={errors.minutes ? 'true' : undefined}
            onChange={(event) => {
              setMinutes(event.target.value);
              clear('minutes');
            }}
          />
          {errors.minutes ? (
            <p className={styles.errorText} role="alert">
              {errors.minutes}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${ids}-url`}>
            Video link (optional)
          </label>
          <input
            id={`${ids}-url`}
            className={inputClass('videoUrl')}
            value={videoUrl}
            maxLength={500}
            placeholder="https://…"
            aria-invalid={errors.videoUrl ? 'true' : undefined}
            onChange={(event) => {
              setVideoUrl(event.target.value);
              clear('videoUrl');
            }}
          />
          {errors.videoUrl ? (
            <p className={styles.errorText} role="alert">
              {errors.videoUrl}
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
