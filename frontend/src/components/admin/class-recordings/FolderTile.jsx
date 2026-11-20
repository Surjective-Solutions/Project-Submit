'use client';

import Icon from '@/components/admin/Icon';
import { plural } from '@/class-recordings/utils';
import KebabMenu from './KebabMenu';
import styles from './classRecordings.module.css';

// A folder in the grid. Click or press Enter to open it. Without onRename / onMove (a teacher's view) it has no menu. `pathLabel` is only set in search results.
export default function FolderTile({ folder, folderCount, recordingCount, pathLabel, onOpen, onOpenPath, onRename, onMove }) {
  return (
    <article
      className={`${styles.card} ${styles.cardHover} ${styles.folderTile}`}
      role="button"
      tabIndex={0}
      aria-label={`Folder ${folder.name}`}
      onClick={() => onOpen(folder)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(folder);
        }
      }}
    >
      <span className={styles.folderIcon}>
        <Icon name="folder" size={26} fill={1} />
      </span>
      <div className={styles.folderText}>
        <p className={styles.folderName}>{folder.name}</p>
        <p className={styles.folderMeta}>
          {plural(folderCount, 'folder')} · {plural(recordingCount, 'recording')}
        </p>
        {pathLabel ? (
          <button
            type="button"
            className={styles.resultPath}
            onClick={(event) => {
              event.stopPropagation();
              onOpenPath();
            }}
            onKeyDown={(event) => event.stopPropagation()}
          >
            in {pathLabel}
          </button>
        ) : null}
      </div>
      {onRename || onMove ? (
        <KebabMenu
          label={`Actions for folder ${folder.name}`}
          items={[
            { label: 'Rename', icon: 'edit', onSelect: () => onRename(folder) },
            { label: 'Move to…', icon: 'drive_file_move', onSelect: () => onMove(folder) },
          ]}
        />
      ) : null}
    </article>
  );
}
