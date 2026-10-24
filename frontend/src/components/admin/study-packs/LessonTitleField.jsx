'use client';

import { TITLE_MAX } from '@/study-packs/sessionUtils';
import base from './study-packs.module.css';
import s from './add-recordings.module.css';

// Always visible. Starts empty; the admin writes the title students will see.
export default function LessonTitleField({ value, onChange, onEnter, error, recording, onUseTitle, inputRef }) {
  return (
    <div className={s.titleBlock}>
      <label htmlFor="rec-title" className={base.label}>
        Lesson title<span className={base.req}> *</span>
      </label>
      <p className={base.hint}>Shown to students so they know which topic this session covers.</p>

      <input
        id="rec-title"
        ref={inputRef}
        type="text"
        className={error ? `${s.titleInput} ${s.titleInvalid}` : s.titleInput}
        value={value}
        maxLength={TITLE_MAX}
        placeholder="e.g. Projectile motion — horizontal launch"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? 'rec-title-error' : undefined}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onEnter();
          }
        }}
      />

      {recording ? (
        <p className={s.classTitle}>
          Class Recordings title: “{recording.title}”
          {value.trim() !== recording.title ? (
            <button type="button" className={s.linkButton} onClick={() => onUseTitle(recording.title)}>
              Use this
            </button>
          ) : null}
        </p>
      ) : null}

      {error ? (
        <p id="rec-title-error" className={base.errorText}>
          Add a lesson title before adding this session.
        </p>
      ) : null}
    </div>
  );
}
