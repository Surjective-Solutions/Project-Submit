'use client';

import Icon from '@/components/admin/Icon';
import { sessionsSummary } from '@/study-packs/sessionUtils';
import base from './study-packs.module.css';
import s from './add-recordings.module.css';
import SessionRow from './SessionRow';
import UndoBar from './UndoBar';

export default function SessionList({
  items,
  justAdded,
  showErrors,
  undo,
  onUndo,
  onTitleChange,
  onMove,
  onRemove,
}) {
  return (
    <section className={base.formCard}>
      <header className={base.sectionHeader}>
        <span className={base.sectionIcon} aria-hidden="true">
          <Icon name="video_library" size={19} />
        </span>
        <div className={base.sectionText}>
          <h2 className={base.sectionTitle}>Sessions in this pack</h2>
          <p className={base.sectionSubtitle}>{sessionsSummary(items)}</p>
        </div>
      </header>

      {undo ? <UndoBar title={undo.item.title || undo.item.recordingCode} onUndo={onUndo} /> : null}

      {items.length === 0 ? (
        <div className={s.emptySessions}>
          <Icon name="playlist_add" size={32} style={{ color: '#8b90a0' }} />
          <strong className={s.emptyTitle}>No recordings yet</strong>
          <span className={s.emptyHint}>Paste a code above to add the first session.</span>
        </div>
      ) : (
        <ol className={s.sessionList}>
          {items.map((item, index) => (
            <SessionRow
              key={item.recordingCode}
              item={item}
              index={index}
              count={items.length}
              highlight={item.recordingCode === justAdded}
              showError={showErrors}
              onTitleChange={onTitleChange}
              onMove={onMove}
              onRemove={onRemove}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
