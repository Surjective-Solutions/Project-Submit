'use client';

import { useState } from 'react';
import Icon from '@/components/admin/Icon';
import Modal from './Modal';
import styles from './classRecordings.module.css';

// "Move to…": the tutor's folders as an indented tree, with the tutor's top level as the root.
//   currentParentId  where the item is now (shown as "Current" and can't be picked)
//   disabledIds      folders that can't be picked: for a folder, itself and everything inside it
//   onMove(parentId) may throw; its message is shown under the tree
export default function MoveModal({ itemName, tutor, index, currentParentId, disabledIds, onMove, onClose }) {
  // undefined = nothing picked yet; null = the top level
  const [selected, setSelected] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function move() {
    if (selected === undefined || busy) return;
    setBusy(true);
    try {
      await onMove(selected);
    } catch (err) {
      setError(err?.message || 'Could not move it. Please try again.');
      setBusy(false);
    }
  }

  // plain functions (not components), so the rows aren't rebuilt from scratch on every click
  function renderRow({ id, name, depth, icon }) {
    const isCurrent = id === currentParentId;
    const disabled = isCurrent || (id !== null && disabledIds.has(id));
    const picked = selected === id;
    return (
      <button
        key={id ?? 'root'}
        type="button"
        role="option"
        aria-selected={picked}
        disabled={disabled}
        className={picked ? `${styles.treeRow} ${styles.treeRowSelected}` : styles.treeRow}
        style={{ paddingLeft: 10 + depth * 20 }}
        onClick={() => setSelected(id)}
      >
        <Icon name={icon} size={20} style={{ color: id === null ? 'var(--navy)' : 'var(--folder-ink)' }} />
        <span>{name}</span>
        {isCurrent ? <span className={styles.currentTag}>Current</span> : null}
      </button>
    );
  }

  function renderBranch(parentId, depth) {
    return index.childrenOf(parentId).flatMap((folder) => [
      renderRow({ id: folder.id, name: folder.name, depth, icon: 'folder' }),
      ...renderBranch(folder.id, depth + 1),
    ]);
  }

  return (
    <Modal
      title="Move to…"
      onClose={onClose}
      dismissible={!busy}
      footer={
        <>
          <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={selected === undefined || busy}
            onClick={move}
          >
            Move here
          </button>
        </>
      }
    >
      <div className={styles.strip}>Moving “{itemName}”</div>
      <div className={styles.tree} role="listbox" aria-label="Choose a folder">
        {renderRow({ id: null, name: tutor.name, depth: 0, icon: 'home' })}
        {renderBranch(null, 1)}
      </div>
      {error ? (
        <p className={styles.errorText} role="alert">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
