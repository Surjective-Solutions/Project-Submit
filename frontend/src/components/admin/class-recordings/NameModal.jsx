'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Modal from './Modal';
import styles from './classRecordings.module.css';

// One text box: a new folder, a folder's new name, or a recording's new title.
//   validate(value) -> an error message or ''
//   onSubmit(value) may throw; its message is shown under the box
//   context: the "Created in ..." line (new folder only)
export default function NameModal({ title, label, initial = '', submitLabel, context, validate, onSubmit, onClose }) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const inputId = useId();

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const problem = validate(value);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    try {
      await onSubmit(value.trim());
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      dismissible={!busy}
      footer={
        <>
          <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" form={`${inputId}-form`} className={styles.btnPrimary} disabled={busy}>
            {submitLabel}
          </button>
        </>
      }
    >
      <form id={`${inputId}-form`} onSubmit={submit} noValidate>
        {context ? <div className={styles.strip}>{context}</div> : null}
        <div className={styles.field} style={context ? { marginTop: 14 } : undefined}>
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
          <input
            id={inputId}
            ref={inputRef}
            className={error ? `${styles.input} ${styles.inputInvalid}` : styles.input}
            value={value}
            maxLength={200}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError('');
            }}
          />
          {error ? (
            <p id={`${inputId}-error`} className={styles.errorText} role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
