'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/admin/Icon';
import { classes as classesApi } from '@/classes/api';
import { RESOURCE_FILE_TYPES, RESOURCE_TITLE_MAX, RESOURCE_TYPES } from '@/classes/constants';
import { checkResourceFile, formatSize, isWebUrl, titleFromFileName, validateResource } from '@/classes/classUtils';
import { formatDateTime } from '@/classes/sessionUtils';
import ConfirmDialog from './ConfirmDialog';
import Dialog from './Dialog';
import { ChoiceGroup, Field, SelectBox } from './FormParts';
import styles from './classes.module.css';
import s from './sessions.module.css';

const SOURCES = [
  { value: 'file', label: 'Upload a file', icon: 'upload_file', hint: 'From your computer' },
  { value: 'link', label: 'Paste a link', icon: 'link', hint: 'YouTube, Drive or any web page' },
];
const typeInfo = (value) => RESOURCE_TYPES.find((t) => t.value === value) || RESOURCE_TYPES[RESOURCE_TYPES.length - 1];
const emptyDraft = { type: 'paper', title: '', kind: 'file', file: null, url: '' };

// The material of one session: videos, papers, answer sheets and so on. Each can be an uploaded file or a link.
// onCountChange(n) tells the table how many resources the session now has.
export default function ResourcesDialog({ classId, session, onCountChange, onClose }) {
  const [state, setState] = useState({ status: 'loading', items: [] });
  const [draft, setDraft] = useState(emptyDraft);
  const [fileError, setFileError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [removing, setRemoving] = useState(null); // { resource, busy, error }
  const fileInput = useRef(null);
  const mounted = useRef(true);

  const load = useCallback(() => {
    setState({ status: 'loading', items: [] });
    classesApi
      .resources(classId, session.id)
      .then((items) => mounted.current && setState({ status: 'ready', items }))
      .catch(() => mounted.current && setState({ status: 'error', items: [] }));
  }, [classId, session.id]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const set = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const { errors, count } = validateResource(draft);
  const show = (key) => attempted && errors[key];

  function chooseFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = checkResourceFile(file);
    setFileError(problem);
    if (problem) return;
    // The title is filled from the file name unless one was typed.
    setDraft((current) => ({ ...current, file, title: current.title.trim() ? current.title : titleFromFileName(file.name) }));
  }

  async function add() {
    if (adding) return;
    setAttempted(true);
    setAddError('');
    if (count > 0) {
      const target = errors.title ? 'resource-title' : errors.file ? 'resource-choose-file' : 'resource-url';
      document.getElementById(target)?.focus();
      return;
    }
    setAdding(true);
    try {
      const { resource } = await classesApi.addResource(classId, session.id, {
        type: draft.type,
        title: draft.title.trim(),
        kind: draft.kind,
        file: draft.kind === 'file' ? draft.file : null,
        url: draft.kind === 'link' ? draft.url.trim() : null,
      });
      if (!mounted.current) return;
      const items = [...state.items, resource];
      setState({ status: 'ready', items });
      onCountChange(items.length);
      setDraft({ ...emptyDraft, type: draft.type, kind: draft.kind });
      setFileError('');
      setAttempted(false);
      setAdding(false);
      toast.success(`“${resource.title}” added.`);
      document.getElementById('resource-title')?.focus();
    } catch {
      if (mounted.current) {
        setAdding(false);
        setAddError('Couldn’t add the resource. Check the connection and try again.');
      }
    }
  }

  async function confirmRemove() {
    const { resource } = removing;
    setRemoving({ resource, busy: true, error: '' });
    try {
      await classesApi.deleteResource(classId, session.id, resource.id);
      if (!mounted.current) return;
      const items = state.items.filter((r) => r.id !== resource.id);
      setState({ status: 'ready', items });
      onCountChange(items.length);
      setRemoving(null);
      toast.success(`“${resource.title}” removed.`);
      document.getElementById('resource-title')?.focus();
    } catch {
      if (mounted.current) setRemoving({ resource, busy: false, error: 'Couldn’t remove the resource. Check the connection and try again.' });
    }
  }

  return (
    <>
      <Dialog
        title="Resources"
        titleId="resources-title"
        icon="folder_open"
        size="lg"
        onClose={onClose}
        footer={
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={s.panel}>
          <p className={s.participantsFor}>
            <strong>{session.name}</strong>
            <span>{formatDateTime(session.startsAt)}</span>
          </p>

          {state.status === 'loading' && (
            <div className={s.resourceList} role="status" aria-busy="true" aria-label="Loading resources">
              <div className={styles.skeleton} style={{ minHeight: 56 }} />
              <div className={styles.skeleton} style={{ minHeight: 56 }} />
            </div>
          )}

          {state.status === 'error' && (
            <div className={styles.errorBox} role="alert">
              <Icon name="error" size={20} weight={600} fill={1} />
              <span className={styles.errorText}>Couldn’t load the resources.</span>
              <button type="button" className={styles.secondaryButton} onClick={load}>
                <Icon name="refresh" size={18} weight={600} />
                Try again
              </button>
            </div>
          )}

          {state.status === 'ready' &&
            (state.items.length === 0 ? (
              <div className={s.resourceEmpty} role="status" data-testid="resources-empty">
                <Icon name="folder_open" size={26} weight={400} />
                <p>No resources yet. Add a video, paper or answer sheet below.</p>
              </div>
            ) : (
              <ul className={s.resourceList} aria-label="Resources of this session">
                {state.items.map((resource) => {
                  const info = typeInfo(resource.type);
                  const openable = resource.url && resource.url !== '#';
                  const meta = [info.label, resource.kind === 'link' ? 'Link' : resource.fileName, resource.kind === 'file' ? formatSize(resource.size) : '']
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <li key={resource.id} className={s.resource}>
                      <span className={s.resourceIcon} aria-hidden="true">
                        <Icon name={info.icon} size={21} weight={500} />
                      </span>
                      <span className={s.resourceText}>
                        {openable ? (
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" className={s.resourceTitle}>
                            {resource.title}
                          </a>
                        ) : (
                          <span className={s.resourceTitle}>{resource.title}</span>
                        )}
                        <span className={s.resourceMeta}>{meta}</span>
                      </span>
                      <button
                        type="button"
                        className={`${s.rowButton} ${s.rowButtonDanger}`}
                        onClick={() => setRemoving({ resource, busy: false, error: '' })}
                        aria-label={`Remove ${resource.title}`}
                      >
                        <Icon name="delete" size={19} weight={500} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ))}

          <section className={s.block} aria-labelledby="resource-add-title">
            <h3 id="resource-add-title" className={s.blockTitle}>
              Add a resource
            </h3>
            {addError && (
              <div className={styles.errorBox} role="alert">
                <Icon name="error" size={20} weight={600} fill={1} />
                <span className={styles.errorText}>{addError}</span>
              </div>
            )}
            <div className={s.row2}>
              <Field id="resource-type" label="Type">
                <SelectBox id="resource-type" value={draft.type} onChange={(event) => set({ type: event.target.value })}>
                  {RESOURCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </SelectBox>
              </Field>
              <Field id="resource-title" label="Title" required error={show('title') && 'Give the resource a title.'}>
                <input
                  id="resource-title"
                  className={`${s.input} ${show('title') ? s.inputError : ''}`}
                  type="text"
                  value={draft.title}
                  maxLength={RESOURCE_TITLE_MAX}
                  placeholder="e.g. Paper 1 — 2024"
                  autoComplete="off"
                  data-autofocus
                  onChange={(event) => set({ title: event.target.value })}
                />
              </Field>
            </div>

            <ChoiceGroup
              legend="Source"
              name="resource-source"
              options={SOURCES}
              value={draft.kind}
              onChange={(kind) => {
                setFileError('');
                set({ kind });
              }}
            />

            {draft.kind === 'file' ? (
              <div className={styles.field}>
                <span className={styles.label} id="resource-file-label">
                  File <span className={styles.req} aria-hidden="true">*</span>
                </span>
                <div className={s.fileRow}>
                  <button
                    type="button"
                    id="resource-choose-file"
                    className={styles.secondaryButton}
                    onClick={() => fileInput.current?.click()}
                    aria-describedby="resource-file-label"
                  >
                    <Icon name="upload" size={18} weight={600} />
                    {draft.file ? 'Replace file' : 'Choose file'}
                  </button>
                  <span className={s.fileName} data-testid="resource-file-name">
                    {draft.file ? `${draft.file.name} · ${formatSize(draft.file.size)}` : 'No file chosen'}
                  </span>
                  <input
                    ref={fileInput}
                    id="resource-file"
                    type="file"
                    accept={RESOURCE_FILE_TYPES.map((t) => `.${t}`).join(',')}
                    className={s.srOnly}
                    tabIndex={-1}
                    aria-labelledby="resource-file-label"
                    onChange={chooseFile}
                  />
                </div>
                {fileError ? (
                  <p className={s.fieldError} role="alert">
                    {fileError}
                  </p>
                ) : show('file') ? (
                  <p className={s.fieldError} role="alert">
                    Choose a file to upload.
                  </p>
                ) : (
                  <p className={s.hint}>PDF, Word, PowerPoint, images or video. Up to 25 MB, or 200 MB for video.</p>
                )}
              </div>
            ) : (
              <Field
                id="resource-url"
                label="Link"
                required
                error={show('url') && (draft.url.trim() && !isWebUrl(draft.url) ? 'Enter a full link starting with https://.' : 'Paste the link.')}
              >
                <input
                  id="resource-url"
                  className={`${s.input} ${show('url') ? s.inputError : ''}`}
                  type="url"
                  inputMode="url"
                  value={draft.url}
                  placeholder="https://"
                  autoComplete="off"
                  onChange={(event) => set({ url: event.target.value })}
                />
              </Field>
            )}

            <div className={s.addRow}>
              <button type="button" className={styles.primaryButton} onClick={add} disabled={adding}>
                <Icon name="add" size={20} weight={600} />
                {adding ? 'Adding…' : 'Add resource'}
              </button>
            </div>
          </section>
        </div>
      </Dialog>

      {removing && (
        <ConfirmDialog
          title="Remove resource?"
          message={`“${removing.resource.title}” will be removed from this session and students will no longer see it. This can’t be undone.`}
          confirmLabel="Remove resource"
          busyLabel="Removing…"
          busy={removing.busy}
          error={removing.error}
          onConfirm={confirmRemove}
          onCancel={() => setRemoving(null)}
        />
      )}
    </>
  );
}
