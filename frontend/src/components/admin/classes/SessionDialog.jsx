'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { SESSION_ACCESS, SESSION_MODES, SESSION_NAME_MAX } from '@/classes/constants';
import { getRecordingByCode } from '@/classes/recordings';
import {
  ERROR_MESSAGES,
  emptyForm,
  formToPayload,
  normalizeCode,
  sessionToForm,
  shareTotal,
  validateSession,
} from '@/classes/sessionUtils';
import Dialog from './Dialog';
import RecordingField from './RecordingField';
import ShareFields from './ShareFields';
import styles from './classes.module.css';
import s from './sessions.module.css';

function ChoiceGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset className={s.choiceSet}>
      <legend className={styles.label}>{legend}</legend>
      <div className={s.choices}>
        {options.map((option) => (
          <label key={option.value} className={`${s.choice} ${value === option.value ? s.choiceOn : ''}`}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={s.srOnly}
            />
            {option.icon && <Icon name={option.icon} size={20} weight={500} />}
            <span className={s.choiceText}>
              <span className={s.choiceLabel}>{option.label}</span>
              <span className={s.choiceHint}>{option.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Field({ id, label, required, error, children, hint }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}{' '}
        {required && (
          <span className={styles.req} aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className={s.hint}>{hint}</p>}
      {error && (
        <p className={s.fieldError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Create or edit one session. `session` is given when editing. Attendance is not here; it has its own dialog.
// onSave(payload) must return a promise; if it rejects the dialog stays open and shows an error.
export default function SessionDialog({ session = null, halls, classInfo, onSave, onClose }) {
  const editing = !!session;
  const [form, setForm] = useState(() => (editing ? sessionToForm(session) : emptyForm()));
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [rec, setRec] = useState({
    codeText: session?.recordingCode || '',
    status: session?.recordingCode ? 'loading' : 'idle',
    recording: null,
  });
  const [recError, setRecError] = useState('');
  const mounted = useRef(true);
  const lookupToken = useRef(0);

  useEffect(() => {
    mounted.current = true;
    if (session?.recordingCode) lookup(session.recordingCode, true);
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { errors, count, total } = validateSession(form);
  const show = (key) => attempted && errors[key];
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  // Looks a code up in Class Recordings. `initial` is the check of the code the session already had.
  async function lookup(rawCode, initial = false) {
    const code = normalizeCode(rawCode);
    const token = (lookupToken.current += 1);
    setRecError('');
    setRec({ codeText: code, status: 'loading', recording: null });
    let found = null;
    let failed = false;
    try {
      found = await getRecordingByCode(code);
    } catch {
      failed = true;
    }
    if (!mounted.current || token !== lookupToken.current) return null;
    if (found) {
      setRec({ codeText: found.code, status: 'found', recording: found });
    } else {
      const status = failed ? 'error' : initial && code === session?.recordingCode ? 'missing' : 'notfound';
      setRec({ codeText: code, status, recording: null });
    }
    return found;
  }

  function changeCode(value) {
    setRecError('');
    setRec((current) => {
      const same = current.status === 'found' && normalizeCode(value) === current.recording.code;
      return same ? { ...current, codeText: value } : { codeText: value, status: 'idle', recording: null };
    });
  }

  async function submit() {
    if (saving) return;
    setAttempted(true);
    setSaveError('');
    const check = validateSession(form);
    if (check.count > 0) {
      const firstInvalid = [
        ['name', 'session-name'],
        ['startDate', 'session-start-date'],
        ['startTime', 'session-start-time'],
        ['hall', 'session-hall'],
        ['expiresDate', 'session-expires-date'],
        ['expires', 'session-expires-date'],
        ['shares', 'share-teacher'],
      ].find(([key]) => check.errors[key]);
      if (firstInvalid) document.getElementById(firstInvalid[1])?.focus();
      return;
    }

    // The recording must be one that exists: use what was already found, or look the typed code up now.
    const typed = normalizeCode(rec.codeText);
    let code = '';
    if (typed) {
      if (rec.status === 'loading') return;
      if (rec.status === 'found' && rec.recording.code === typed) code = typed;
      else if (rec.status === 'missing' && typed === session?.recordingCode) code = typed;
      else {
        const found = await lookup(typed);
        if (!found) {
          setRecError('That recording code was not found. Correct it, or clear the box to save without a recording.');
          document.getElementById('session-recording-code')?.focus();
          return;
        }
        code = found.code;
      }
    }

    setSaving(true);
    try {
      await onSave(formToPayload(form, code));
    } catch {
      if (mounted.current) {
        setSaving(false);
        setSaveError('Couldn’t save the session. Check the connection and try again.');
      }
    }
  }

  const footer = (
    <>
      <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={saving}>
        Cancel
      </button>
      <button type="button" className={styles.primaryButton} onClick={submit} disabled={saving}>
        {saving ? 'Saving…' : editing ? 'Save changes' : 'Create session'}
      </button>
    </>
  );

  return (
    <Dialog
      title={editing ? 'Edit session' : 'Create session'}
      titleId="session-dialog-title"
      icon={editing ? 'edit_calendar' : 'event_available'}
      size="lg"
      closeOnOverlay={false}
      onClose={saving ? () => {} : onClose}
      footer={footer}
    >
      <div className={s.panel}>
        {attempted && (count > 0 || saveError) && (
          <div className={styles.errorBox} role="alert">
            <Icon name="error" size={20} weight={600} fill={1} />
            <span className={styles.errorText}>
              {saveError ||
                `Fix ${count} ${count === 1 ? 'thing' : 'things'} to save this session.${errors.shares ? ` The shares add up to ${total}%.` : ''}`}
            </span>
          </div>
        )}

        <Field id="session-name" label="Session name" required error={show('name') && ERROR_MESSAGES.name}>
          <input
            id="session-name"
            className={`${s.input} ${show('name') ? s.inputError : ''}`}
            type="text"
            value={form.name}
            maxLength={SESSION_NAME_MAX}
            placeholder="e.g. Projectile motion — horizontal launch"
            autoComplete="off"
            data-autofocus
            onChange={(event) => set({ name: event.target.value })}
          />
        </Field>

        <ChoiceGroup
          legend="Session access"
          name="session-access"
          options={SESSION_ACCESS}
          value={form.access}
          onChange={(access) => set({ access })}
        />

        <ChoiceGroup
          legend="Session type"
          name="session-mode"
          options={SESSION_MODES}
          value={form.mode}
          onChange={(mode) => set({ mode })}
        />

        <div className={s.row2}>
          <Field id="session-start-date" label="Start date" required error={show('startDate') && ERROR_MESSAGES.startDate}>
            <input
              id="session-start-date"
              className={`${s.input} ${show('startDate') ? s.inputError : ''}`}
              type="date"
              value={form.startDate}
              onChange={(event) => set({ startDate: event.target.value })}
            />
          </Field>
          <Field id="session-start-time" label="Start time" required error={show('startTime') && ERROR_MESSAGES.startTime}>
            <input
              id="session-start-time"
              className={`${s.input} ${show('startTime') ? s.inputError : ''}`}
              type="time"
              value={form.startTime}
              onChange={(event) => set({ startTime: event.target.value })}
            />
          </Field>
        </div>

        {form.mode === 'physical' && (
          <Field id="session-hall" label="Hall" required error={show('hall') && ERROR_MESSAGES.hall}>
            <div className={styles.selectWrap}>
              <select
                id="session-hall"
                className={`${styles.select} ${show('hall') ? s.inputError : ''}`}
                value={form.hall}
                onChange={(event) => set({ hall: event.target.value })}
              >
                <option value="">Select a hall</option>
                {halls.map((hall) => (
                  <option key={hall.id} value={hall.name}>
                    {hall.name}
                  </option>
                ))}
              </select>
              <span className={styles.selectIcon} aria-hidden="true">
                <Icon name="expand_more" size={22} weight={500} />
              </span>
            </div>
          </Field>
        )}

        <div className={s.row2}>
          <Field
            id="session-expires-date"
            label="Expires on"
            error={(show('expiresDate') && ERROR_MESSAGES.expiresDate) || (show('expires') && ERROR_MESSAGES.expires)}
            hint="Leave empty if the session never expires."
          >
            <input
              id="session-expires-date"
              className={`${s.input} ${show('expiresDate') || show('expires') ? s.inputError : ''}`}
              type="date"
              value={form.expiresDate}
              onChange={(event) => set({ expiresDate: event.target.value })}
            />
          </Field>
          <Field id="session-expires-time" label="Expiry time">
            <div className={s.inline}>
              <input
                id="session-expires-time"
                className={s.input}
                type="time"
                value={form.expiresTime}
                onChange={(event) => set({ expiresTime: event.target.value })}
              />
              {(form.expiresDate || form.expiresTime) && (
                <button type="button" className={s.clearLink} onClick={() => set({ expiresDate: '', expiresTime: '' })}>
                  Clear
                </button>
              )}
            </div>
          </Field>
        </div>

        <section className={s.block} aria-labelledby="session-recording-title">
          <h3 id="session-recording-title" className={s.blockTitle}>
            Recording
          </h3>
          <RecordingField
            codeText={rec.codeText}
            state={rec}
            classSubject={classInfo.subject}
            error={recError}
            onCodeText={changeCode}
            onFind={(code) => lookup(code)}
            onClear={() => {
              setRecError('');
              setRec({ codeText: '', status: 'idle', recording: null });
            }}
          />
        </section>

        <section className={s.block} aria-labelledby="session-shares-title">
          <h3 id="session-shares-title" className={s.blockTitle}>
            Revenue share
          </h3>
          <p className={s.hint}>How this session’s income is split. The three shares must add up to 100%.</p>
          <ShareFields
            shares={form.shares}
            total={shareTotal(form.shares)}
            showError={attempted}
            onChange={(key, value) => set({ shares: { ...form.shares, [key]: value } })}
          />
        </section>
      </div>

    </Dialog>
  );
}
