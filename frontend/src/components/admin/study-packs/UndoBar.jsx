'use client';

import s from './add-recordings.module.css';

// Shown at the top of the sessions card for a few seconds after a session is removed.
export default function UndoBar({ title, onUndo }) {
  return (
    <div className={s.undoBar} role="status">
      <span className={s.undoText}>“{title}” removed from the pack.</span>
      <button type="button" className={s.undoButton} onClick={onUndo}>
        Undo
      </button>
    </div>
  );
}
