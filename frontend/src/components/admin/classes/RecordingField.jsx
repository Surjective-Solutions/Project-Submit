'use client';

import { useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { formatClassDate, formatDuration, normalizeCode } from '@/classes/sessionUtils';
import s from './sessions.module.css';

// Links a session to a recording in Class Recordings by its code, the same way Study Packs does:
// type or paste the code (pasting looks it up straight away), press Enter or "Find recording".
// The lookup itself lives in the dialog; this component shows the box and the result.
export default function RecordingField({ codeText, state, classSubject, error, onCodeText, onFind, onClear }) {
  const inputRef = useRef(null);
  const [hint, setHint] = useState('');
  const { status, recording } = state;
  const typed = normalizeCode(codeText);

  async function pasteFromClipboard() {
    setHint('');
    try {
      const code = normalizeCode(await navigator.clipboard.readText());
      onCodeText(code);
      if (code) onFind(code);
    } catch {
      inputRef.current?.focus();
      setHint('Your browser blocked the Paste button. Click in the code box and press Ctrl+V.');
    }
  }

  const borderClass = error || status === 'notfound' || status === 'error' ? s.inputError : status === 'found' ? s.inputFound : '';
  const differentSubject =
    status === 'found' && recording?.subject && classSubject && recording.subject.toLowerCase() !== classSubject.toLowerCase();

  return (
    <div className={s.recording}>
      <div className={s.codeRow}>
        <div className={`${s.codeGroup} ${borderClass}`}>
          <Icon name="tag" size={19} weight={500} />
          <input
            ref={inputRef}
            id="session-recording-code"
            className={s.codeInput}
            type="text"
            value={codeText}
            placeholder="e.g. REC-PHY-0614-K7"
            autoComplete="off"
            spellCheck={false}
            aria-label="Recording code"
            aria-invalid={error || status === 'notfound' ? 'true' : undefined}
            onChange={(event) => {
              setHint('');
              onCodeText(event.target.value.toUpperCase());
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                if (typed) onFind(typed);
              }
            }}
            onPaste={(event) => {
              const text = event.clipboardData?.getData('text');
              if (!text) return;
              event.preventDefault();
              const code = normalizeCode(text);
              setHint('');
              onCodeText(code);
              if (code) onFind(code);
            }}
          />
          <button type="button" className={s.pasteChip} onClick={pasteFromClipboard}>
            <Icon name="content_paste" size={16} weight={500} />
            Paste
          </button>
        </div>
        <button type="button" className={s.findButton} onClick={() => typed && onFind(typed)} disabled={status === 'loading'}>
          <Icon name="search" size={19} weight={600} />
          Find recording
        </button>
      </div>

      <p className={s.help}>
        <Icon name="info" size={15} weight={500} />
        Class Recordings → open a recording → Copy code. Leave empty if there is no recording yet.
      </p>
      {hint && (
        <p className={s.help} role="status">
          {hint}
        </p>
      )}
      {error && !hint && (
        <p className={s.fieldError} role="alert">
          {error}
        </p>
      )}

      <div aria-live="polite">
        {status === 'loading' && <p className={s.lookupNote}>Looking up {typed || 'the recording'}…</p>}

        {status === 'notfound' && (
          <div className={`${s.notice} ${s.noticeError}`}>
            <Icon name="search_off" size={20} weight={500} />
            <span>No recording found for {typed}. Check the code in Class Recordings and try again.</span>
          </div>
        )}

        {status === 'error' && (
          <div className={`${s.notice} ${s.noticeError}`}>
            <Icon name="error" size={20} weight={500} />
            <span>Couldn’t look up the recording. Check the connection and try again.</span>
          </div>
        )}

        {status === 'missing' && (
          <div className={`${s.notice} ${s.noticeWarn}`}>
            <Icon name="warning" size={20} weight={500} />
            <span>
              {typed} isn’t in Class Recordings any more. Saving keeps the code as it is; find another recording to replace it.
            </span>
          </div>
        )}

        {status === 'found' && recording && (
          <div className={`${s.preview} ${differentSubject ? s.previewWarn : ''}`} data-testid="recording-preview">
            <span className={s.thumb} aria-hidden="true">
              <Icon name="play_circle" size={30} weight={400} fill={1} />
              <span className={s.thumbTime}>{formatDuration(recording.durationMins)}</span>
            </span>
            <div className={s.previewBody}>
              <span className={s.foundChip}>Recording found</span>
              <p className={s.previewTitle}>{recording.title}</p>
              <p className={s.previewMeta}>
                <span className={s.codeChipPlain}>{recording.code}</span>
                {recording.classDate && <span>Class on {formatClassDate(recording.classDate)}</span>}
                {recording.medium && <span>{recording.medium} medium</span>}
                {recording.subject && <span>{recording.subject}</span>}
              </p>
              {differentSubject && (
                <p className={s.previewWarning}>
                  This recording is from {recording.subject}, but this class is {classSubject}. Make sure it’s the right code.
                </p>
              )}
            </div>
            <button type="button" className={s.removeLink} onClick={onClear}>
              <Icon name="link_off" size={17} weight={500} />
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
