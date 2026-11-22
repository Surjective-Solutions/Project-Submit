'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/admin/Icon';
import { directoryHref, folderHref } from '@/class-recordings/paths';
import {
  buildIndex,
  copyText,
  pathOf,
  plural,
  searchLibrary,
  subtreeIds,
} from '@/class-recordings/utils';
import { folderNameError, recordingTitleError } from '@/class-recordings/validators';
import FolderTile from './FolderTile';
import { useLibrary } from './LibraryProvider';
import MoveModal from './MoveModal';
import NameModal from './NameModal';
import RecordingRow from './RecordingRow';
import Toast from './Toast';
import TutorAvatar, { LevelTag } from './TutorAvatar';
import UploadModal from './UploadModal';
import styles from './classRecordings.module.css';

const HIGHLIGHT_MS = 2800;

// View 2: one tutor's folders and recordings. `folderId` is the open folder (null = the tutor's top level).
//
// The same page serves the admin and the teacher account:
//   canManageFolders  false for teachers: no "New folder", and folders have no Rename / Move menu. They can only
//                     upload into the folders an admin made.
//   ownLibrary        true for teachers: their own library, so a page title replaces the tutor header and the top
//                     level is called "All recordings".
//   hrefFor(folderId) the address of a folder (null = top level); defaults to the admin routes.
//   exitHref          where "Back" ends up from the top level; null hides the Back link there (a teacher has no directory).
export default function TutorRecordingsPage({
  folderId = null,
  canManageFolders = true,
  ownLibrary = false,
  hrefFor = null,
  exitHref = directoryHref(),
}) {
  const router = useRouter();
  const { status, error, tutor, folders, recordings, actions } = useLibrary();

  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null); // { kind, target? }
  const [highlightId, setHighlightId] = useState(null);
  const [toast, setToast] = useState(null);
  const highlightTimer = useRef(null);

  useEffect(() => () => clearTimeout(highlightTimer.current), []);
  // a different folder starts with an empty search
  useEffect(() => setQuery(''), [folderId]);

  const showToast = useCallback((message) => setToast({ id: Date.now() + Math.random(), message }), []);
  const clearToast = useCallback(() => setToast(null), []);

  const index = useMemo(() => buildIndex(folders, recordings), [folders, recordings]);
  const folder = folderId ? index.byId.get(folderId) ?? null : null;
  const path = useMemo(() => pathOf(folderId, index.byId), [folderId, index]);

  const hrefOf = (id) => (hrefFor ? hrefFor(id) : folderHref(tutor.id, id));
  const open = (id) => router.push(hrefOf(id));

  // "Back" goes to the page the admin came from. When there is nothing to go back to
  // (the page was opened directly), it steps up one level instead: the parent folder, or the tutor directory.
  const goBack = (fallbackHref) => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };
  const upHref = () => (folder ? hrefOf(folder.parentId ?? null) : exitHref);

  if (status === 'loading') return <div className={styles.page}><div className={styles.loading}>Loading recordings…</div></div>;
  if (status === 'error') {
    return (
      <div className={styles.page}>
        <button type="button" className={styles.backLink} onClick={() => goBack(exitHref ?? hrefFor?.(null) ?? directoryHref())} aria-label="Go back">
          <Icon name="arrow_back" size={18} />
          Back
        </button>
        <div className={styles.empty}>{error}</div>
      </div>
    );
  }
  if (folderId && !folder) {
    return (
      <div className={styles.page}>
        <button type="button" className={styles.backLink} onClick={() => goBack(hrefOf(null))} aria-label="Go back">
          <Icon name="arrow_back" size={18} />
          Back
        </button>
        <div className={styles.empty}>
          <span className={styles.emptyTitle}>This folder doesn’t exist</span>
          <span>It may have been moved or renamed.</span>
        </div>
      </div>
    );
  }

  // the top level is the tutor's name for an admin, "All recordings" for a teacher in their own library
  const rootName = ownLibrary ? 'All recordings' : tutor.name;
  const namesOf = (list) => [rootName, ...list.map((f) => f.name)].join(' › ');
  const hereLabel = namesOf(path);

  const subFolders = index.childrenOf(folderId);
  const here = recordings
    .filter((r) => (r.folderId ?? null) === (folderId ?? null))
    .sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)));

  const searching = query.trim() !== '';
  const found = searching ? searchLibrary({ folders, recordings, folderId, query }) : null;
  const shownFolders = searching ? found.folders : subFolders.map((f) => ({ folder: f, path: null }));
  const shownRecordings = searching ? found.recordings : here.map((r) => ({ rec: r, path: null }));
  const isEmpty = !searching && subFolders.length === 0 && here.length === 0;

  // ── actions ──
  const closeModal = () => setModal(null);

  function flash(id) {
    clearTimeout(highlightTimer.current);
    setHighlightId(id);
    highlightTimer.current = setTimeout(() => setHighlightId(null), HIGHLIGHT_MS);
  }

  async function createFolder(name) {
    await actions.createFolder({ parentId: folderId, name });
    closeModal();
    showToast('Folder created');
  }

  async function renameFolder(target, name) {
    await actions.updateFolder(target.id, { name });
    closeModal();
    showToast(`Renamed to “${name}”`);
  }

  async function renameRecording(target, title) {
    await actions.updateRecording(target.id, { title });
    closeModal();
    showToast(`Renamed to “${title}”`);
  }

  async function moveItem(kind, target, parentId) {
    if (kind === 'folder') await actions.updateFolder(target.id, { parentId });
    else await actions.updateRecording(target.id, { folderId: parentId });
    const destination = parentId ? index.byId.get(parentId)?.name : rootName;
    closeModal();
    showToast(`Moved “${kind === 'folder' ? target.name : target.title}” to “${destination}”`);
  }

  async function copyLink(recording) {
    if (await copyText(recording.shareUrl)) showToast('Link copied');
  }

  function openPath(list) {
    setQuery('');
    open(list.length ? list[list.length - 1].id : null);
  }

  // ── pieces ──
  const crumbs = (
    <nav className={styles.crumbs} aria-label="Folder path">
      <button
        type="button"
        className={path.length === 0 ? `${styles.crumb} ${styles.crumbCurrent}` : styles.crumb}
        aria-current={path.length === 0 ? 'page' : undefined}
        onClick={() => open(null)}
      >
        {rootName}
      </button>
      {path.map((part, i) => {
        const current = i === path.length - 1;
        return (
          <span key={part.id} style={{ display: 'contents' }}>
            <span className={styles.crumbSep} aria-hidden="true">
              <Icon name="chevron_right" size={18} />
            </span>
            <button
              type="button"
              className={current ? `${styles.crumb} ${styles.crumbCurrent}` : styles.crumb}
              aria-current={current ? 'page' : undefined}
              onClick={() => open(part.id)}
            >
              {part.name}
            </button>
          </span>
        );
      })}
    </nav>
  );

  const buttons = (
    <>
      {canManageFolders ? (
        <button type="button" className={styles.btnSecondary} onClick={() => setModal({ kind: 'new-folder' })}>
          <Icon name="create_new_folder" size={18} />
          New folder
        </button>
      ) : null}
      <button type="button" className={styles.btnPrimary} onClick={() => setModal({ kind: 'upload' })}>
        <Icon name="upload" size={18} weight={600} />
        Add recording
      </button>
    </>
  );

  // the folders a folder move may not choose: itself and everything in it
  const moveTargets = () => {
    if (modal?.kind === 'move-folder') {
      return {
        itemName: modal.target.name,
        currentParentId: modal.target.parentId ?? null,
        disabledIds: subtreeIds(modal.target.id, index),
      };
    }
    return {
      itemName: modal?.target?.title ?? '',
      currentParentId: modal?.target?.folderId ?? null,
      disabledIds: new Set(),
    };
  };

  return (
    <div className={styles.page}>
      {exitHref !== null || folder ? (
        <button type="button" className={styles.backLink} onClick={() => goBack(upHref())} aria-label="Go back">
          <Icon name="arrow_back" size={18} />
          Back
        </button>
      ) : null}

      {ownLibrary ? (
        <div>
          <h1 className={styles.title}>Class Recordings</h1>
          <p className={styles.subtitle}>
            {canManageFolders
              ? 'Add your class recordings and get a code for each.'
              : 'Add your class recordings and get a code for each.'}
          </p>
        </div>
      ) : (
        <section className={`${styles.card} ${styles.tutorHeader}`} aria-label="Tutor">
          <TutorAvatar tutor={tutor} size={64} />
          <div>
            <div className={styles.tutorHeaderName}>
              <h1>{tutor.name}</h1>
              <LevelTag level={tutor.level} />
            </div>
            <p className={styles.tutorHeaderSub}>{tutor.subject} recordings</p>
          </div>
        </section>
      )}

      <section className={`${styles.card} ${styles.browser}`} aria-label="Recordings">
        <div className={styles.topRow}>
          {crumbs}
          <div className={styles.actions}>
            <div className={`${styles.search} ${styles.searchSmall}`}>
              <span className={styles.searchIcon} aria-hidden="true">
                <Icon name="search" size={20} />
              </span>
              <input
                className={styles.searchInput}
                type="search"
                placeholder="Search title or code"
                aria-label="Search title or code"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            {buttons}
          </div>
        </div>

        <p className={styles.summary} aria-live="polite">
          {searching
            ? `${plural(shownFolders.length, 'folder')} · ${plural(shownRecordings.length, 'recording')} found`
            : `${plural(subFolders.length, 'folder')} · ${plural(here.length, 'recording')}`}
        </p>

        {isEmpty ? (
          <div className={styles.empty}>
            <span className={styles.emptyTitle}>{folderId ? 'This folder is empty' : 'No recordings yet'}</span>
            <span>{canManageFolders ? 'Create a sub-folder or add a recording here.' : 'Add a recording here.'}</span>
            <div className={styles.emptyActions}>{buttons}</div>
          </div>
        ) : null}

        {searching && shownFolders.length === 0 && shownRecordings.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyTitle}>No matches</span>
            <span>Try a different title, folder name or code.</span>
          </div>
        ) : null}

        {shownFolders.length > 0 ? (
          <div>
            <h3 className={styles.sectionLabel}>Folders</h3>
            <div className={styles.folderGrid}>
              {shownFolders.map(({ folder: f, path: parents }) => (
                <FolderTile
                  key={f.id}
                  folder={f}
                  folderCount={index.childrenOf(f.id).length}
                  recordingCount={index.recordingTotal(f.id)}
                  pathLabel={parents ? namesOf(parents) : ''}
                  onOpen={() => {
                    setQuery('');
                    open(f.id);
                  }}
                  onOpenPath={() => openPath(parents)}
                  onRename={canManageFolders ? (target) => setModal({ kind: 'rename-folder', target }) : undefined}
                  onMove={canManageFolders ? (target) => setModal({ kind: 'move-folder', target }) : undefined}
                />
              ))}
            </div>
          </div>
        ) : null}

        {shownRecordings.length > 0 ? (
          <div>
            <h3 className={styles.sectionLabel}>Recordings</h3>
            <div className={styles.recList}>
              {shownRecordings.map(({ rec, path: parents }) => (
                <RecordingRow
                  key={rec.id}
                  recording={rec}
                  highlighted={rec.id === highlightId}
                  pathLabel={parents ? namesOf(parents) : ''}
                  onOpenPath={() => openPath(parents)}
                  onCopyLink={copyLink}
                  onCopiedCode={() => showToast('Code copied')}
                  onRename={(target) => setModal({ kind: 'rename-recording', target })}
                  onMove={(target) => setModal({ kind: 'move-recording', target })}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {canManageFolders && modal?.kind === 'new-folder' ? (
        <NameModal
          title="New folder"
          label="Folder name"
          submitLabel="Create folder"
          context={`Created in ${hereLabel}`}
          validate={(name) => folderNameError(name, subFolders)}
          onSubmit={createFolder}
          onClose={closeModal}
        />
      ) : null}

      {canManageFolders && modal?.kind === 'rename-folder' ? (
        <NameModal
          title="Rename folder"
          label="Folder name"
          initial={modal.target.name}
          submitLabel="Save"
          validate={(name) =>
            folderNameError(name, index.childrenOf(modal.target.parentId ?? null), modal.target.id)
          }
          onSubmit={(name) => renameFolder(modal.target, name)}
          onClose={closeModal}
        />
      ) : null}

      {modal?.kind === 'rename-recording' ? (
        <NameModal
          title="Rename recording"
          label="Recording title"
          initial={modal.target.title}
          submitLabel="Save"
          validate={recordingTitleError}
          onSubmit={(title) => renameRecording(modal.target, title)}
          onClose={closeModal}
        />
      ) : null}

      {(canManageFolders && modal?.kind === 'move-folder') || modal?.kind === 'move-recording' ? (
        <MoveModal
          tutor={{ ...tutor, name: rootName }}
          index={index}
          {...moveTargets()}
          onMove={(parentId) => moveItem(modal.kind === 'move-folder' ? 'folder' : 'recording', modal.target, parentId)}
          onClose={closeModal}
        />
      ) : null}

      {modal?.kind === 'upload' ? (
        <UploadModal
          tutor={tutor}
          folderId={folderId}
          pathLabel={hereLabel}
          onUpload={actions.uploadRecording}
          onUploaded={(recording) => {
            actions.addRecording(recording);
            flash(recording.id);
          }}
          onToast={showToast}
          onClose={closeModal}
        />
      ) : null}

      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}
