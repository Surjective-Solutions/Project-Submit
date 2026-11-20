'use client';

import Icon from '@/components/admin/Icon';
import { formatBytes, formatClock, formatDate, formatDuration } from '@/class-recordings/utils';
import CodeChip from './CodeChip';
import KebabMenu from './KebabMenu';
import styles from './classRecordings.module.css';

// One recording. `pathLabel` is only set in search results, where it opens the folder the recording is in.
export default function RecordingRow({
  recording,
  highlighted,
  pathLabel,
  onOpenPath,
  onCopyLink,
  onCopiedCode,
  onRename,
  onMove,
}) {
  const className = highlighted ? `${styles.recRow} ${styles.recRowHighlight}` : styles.recRow;
  return (
    <div className={className} data-recording={recording.title}>
      <span className={styles.thumb} aria-hidden="true">
        <Icon name="play_arrow" size={24} fill={1} />
        <span className={styles.thumbDur}>{formatClock(recording.durationSec)}</span>
      </span>
      <div className={styles.recMain}>
        <p className={styles.recTitle}>{recording.title}</p>
        <p className={styles.recMeta}>
          {formatDate(recording.uploadedAt)} · {formatDuration(recording.durationSec)} · {formatBytes(recording.sizeBytes)}
        </p>
        {pathLabel ? (
          <button type="button" className={styles.resultPath} onClick={onOpenPath}>
            <Icon name="folder" size={14} fill={1} />
            {pathLabel}
          </button>
        ) : null}
      </div>
      <CodeChip code={recording.code} onCopied={onCopiedCode} />
      <KebabMenu
        label={`Actions for ${recording.title}`}
        items={[
          { label: 'Copy link', icon: 'link', onSelect: () => onCopyLink(recording) },
          { label: 'Rename', icon: 'edit', onSelect: () => onRename(recording) },
          { label: 'Move to…', icon: 'drive_file_move', onSelect: () => onMove(recording) },
        ]}
      />
    </div>
  );
}
