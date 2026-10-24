'use client';

import Icon from '@/components/admin/Icon';
import { coverTint, formatDuration } from '@/study-packs/utils';
import { formatClassDate, TITLE_MAX } from '@/study-packs/sessionUtils';
import s from './add-recordings.module.css';

export default function SessionRow({ item, index, count, highlight, showError, onTitleChange, onMove, onRemove }) {
  const rec = item.recording;
  const tint = coverTint(rec?.subject);
  const invalid = showError && !item.title.trim();
  const number = index + 1;

  return (
    <li className={highlight ? `${s.sessionRow} ${s.sessionRowNew}` : s.sessionRow}>
      <span className={s.rowNumber}>{number}</span>

      <span className={s.rowThumb} style={{ background: tint.bg, color: tint.ink }} aria-hidden="true">
        <Icon name="play_arrow" size={20} fill={1} />
      </span>

      <div className={s.rowBody}>
        <input
          type="text"
          className={invalid ? `${s.rowTitleInput} ${s.rowTitleInvalid}` : s.rowTitleInput}
          value={item.title}
          maxLength={TITLE_MAX}
          aria-label={`Lesson title for session ${number}`}
          aria-invalid={invalid ? 'true' : undefined}
          placeholder="Lesson title"
          onChange={(e) => onTitleChange(index, e.target.value)}
        />
        <div className={s.rowMeta}>
          <span className={s.codeChip}>{item.recordingCode}</span>
          {rec ? (
            <>
              <span>{formatClassDate(rec.classDate)}</span>
              <span>{formatDuration(rec.durationMins)}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className={s.rowControls}>
        <button
          type="button"
          className={s.iconButton}
          aria-label={`Move session ${number} up`}
          title="Move up"
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
        >
          <Icon name="arrow_upward" size={18} weight={600} />
        </button>
        <button
          type="button"
          className={s.iconButton}
          aria-label={`Move session ${number} down`}
          title="Move down"
          disabled={index === count - 1}
          onClick={() => onMove(index, 1)}
        >
          <Icon name="arrow_downward" size={18} weight={600} />
        </button>
        <button
          type="button"
          className={`${s.iconButton} ${s.iconButtonDanger}`}
          aria-label={`Remove session ${number}`}
          title="Remove"
          onClick={() => onRemove(index)}
        >
          <Icon name="delete" size={18} weight={600} />
        </button>
      </div>
    </li>
  );
}
