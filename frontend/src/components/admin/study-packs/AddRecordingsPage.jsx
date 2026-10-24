'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { getRecordingByCode } from '@/study-packs/recordingsApi';
import {
  joinList,
  missingForPublish,
  normalizeCode,
  renumber,
  TITLE_MAX,
} from '@/study-packs/sessionUtils';
import { teacherName, validatePack } from '@/study-packs/utils';
import ActionBar from './ActionBar';
import LessonTitleField from './LessonTitleField';
import PackSummaryAside from './PackSummaryAside';
import RecordingCodeInput from './RecordingCodeInput';
import RecordingLookupResult from './RecordingLookupResult';
import SessionList from './SessionList';
import StepMarker from './StepMarker';
import Toast from './Toast';
import base from './study-packs.module.css';
import s from './add-recordings.module.css';

const UNDO_MS = 8000;
const TOAST_MS = 4000;
const HIGHLIGHT_MS = 4000;

const TITLE_REQUIRED_MESSAGE = 'Every session needs a lesson title so students know which topic it covers.';

function joinParts(...parts) {
  return parts.filter(Boolean).join(' · ');
}

// Step 2 of building a study pack. Nothing is saved until Save / Save & publish here.
// `draft` = { form, coverFile, items } is held by the parent so going back to step 1 keeps the sessions.
// `onItemsChange` accepts a new array or an updater function.
// `onSave({ intent, items })` may throw; the message is shown in the banner.
export default function AddRecordingsPage({
  pack,
  draft,
  teachers,
  onItemsChange,
  onBackToSettings,
  onCancel,
  onSave,
}) {
  const { form, items } = draft;
  const live = pack?.status === 'published';

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [result, setResult] = useState(null);
  const [looking, setLooking] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [pasteHint, setPasteHint] = useState(false);

  const [justAdded, setJustAdded] = useState(null);
  const [undo, setUndo] = useState(null); // { item, index }
  const [toast, setToast] = useState('');

  const [messages, setMessages] = useState([]);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bannerTick, setBannerTick] = useState(0);

  const codeRef = useRef(null);
  const titleRef = useRef(null);
  const bannerRef = useRef(null);
  const lookupId = useRef(0);
  const firstItemsRender = useRef(true);

  // timers that hide the undo bar, toast and highlight
  useEffect(() => {
    if (!undo) return undefined;
    const timer = setTimeout(() => setUndo(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [undo]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!justAdded) return undefined;
    const timer = setTimeout(() => setJustAdded(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [justAdded]);

  useEffect(() => {
    if (bannerTick > 0) bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [bannerTick]);

  // an old error banner goes away as soon as the sessions change
  useEffect(() => {
    if (firstItemsRender.current) {
      firstItemsRender.current = false;
      return;
    }
    setMessages([]);
  }, [items]);

  // ── Recording lookup ──────────────────────────────────────────────────

  async function lookup(raw) {
    const normalized = normalizeCode(raw);
    const requestId = ++lookupId.current;
    setPasteHint(false);
    setCode(normalized);

    if (!normalized) {
      setLooking(false);
      setResult({ status: 'empty' });
      return null;
    }

    const index = items.findIndex((item) => item.recordingCode === normalized);
    if (index >= 0) {
      const duplicate = { status: 'duplicate', code: normalized, n: index + 1 };
      setLooking(false);
      setResult(duplicate);
      return duplicate;
    }

    setLooking(true);
    let outcome;
    try {
      const recording = await getRecordingByCode(normalized);
      outcome = recording
        ? { status: 'found', code: normalized, recording }
        : { status: 'notfound', code: normalized };
    } catch {
      outcome = { status: 'error', code: normalized };
    }
    if (requestId !== lookupId.current) return null; // the code changed while we were waiting

    setLooking(false);
    setResult(outcome);
    if (outcome.status === 'found' && !title.trim()) titleRef.current?.focus();
    return outcome;
  }

  function handleCodeChange(value) {
    lookupId.current += 1; // forget any lookup still in flight
    setLooking(false);
    setCode(normalizeCode(value));
    setResult(null);
    setPasteHint(false);
  }

  async function handlePasteButton() {
    try {
      if (!navigator.clipboard?.readText) throw new Error('Clipboard is not available');
      const text = await navigator.clipboard.readText();
      lookup(text);
    } catch {
      setPasteHint(true);
      codeRef.current?.focus();
    }
  }

  function handleClear() {
    lookupId.current += 1;
    setLooking(false);
    setCode('');
    setTitle('');
    setResult(null);
    setTitleError(false);
    setPasteHint(false);
    codeRef.current?.focus();
  }

  // ── Adding, editing, moving and removing sessions ─────────────────────

  async function handleAdd() {
    if (!normalizeCode(code)) {
      setResult({ status: 'empty' });
      codeRef.current?.focus();
      return;
    }

    let current = result;
    if (!current || current.status === 'empty') current = await lookup(code);
    if (!current || current.status !== 'found') return;

    if (!title.trim()) {
      setTitleError(true);
      titleRef.current?.focus();
      return;
    }

    const recording = current.recording;
    const item = {
      recordingCode: recording.code,
      title: title.trim().slice(0, TITLE_MAX),
      order: items.length + 1,
      recording,
    };
    onItemsChange((prev) => renumber([...prev, item]));
    setJustAdded(recording.code);
    setToast(`“${item.title}” added as session ${item.order}.`);

    setCode('');
    setTitle('');
    setResult(null);
    setTitleError(false);
    codeRef.current?.focus();
  }

  function handleUseTitle(recordingTitle) {
    setTitle(recordingTitle.slice(0, TITLE_MAX));
    setTitleError(false);
  }

  function handleTitleChange(value) {
    setTitle(value);
    if (value.trim()) setTitleError(false);
  }

  function handleSessionTitle(index, value) {
    onItemsChange((prev) => prev.map((item, i) => (i === index ? { ...item, title: value } : item)));
  }

  function handleMove(index, direction) {
    onItemsChange((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return renumber(next);
    });
  }

  function handleRemove(index) {
    const removed = items[index];
    if (!removed) return;
    setUndo({ item: removed, index });
    onItemsChange((prev) => renumber(prev.filter((_, i) => i !== index)));
  }

  function handleUndo() {
    if (!undo) return;
    const { item, index } = undo;
    onItemsChange((prev) => {
      if (prev.some((existing) => existing.recordingCode === item.recordingCode)) return prev;
      const next = [...prev];
      next.splice(Math.min(index, next.length), 0, item);
      return renumber(next);
    });
    setUndo(null);
  }

  // ── Saving ────────────────────────────────────────────────────────────

  async function handleAction(intent) {
    if (saving) return;
    setSaveAttempted(true);

    const publish = intent === 'publish';
    const problems = [];

    if (items.some((item) => !item.title.trim())) problems.push(TITLE_REQUIRED_MESSAGE);

    // publishing, and saving a pack that is already live, needs complete settings and a session
    if (publish || live) {
      const missing = missingForPublish(validatePack(form).errors, items.length);
      if (missing.length > 0) {
        problems.push(`${publish ? 'To publish' : 'To save a live pack'}, the pack needs ${joinList(missing)}.`);
      }
    }

    if (problems.length > 0) {
      setMessages(problems);
      setBannerTick((tick) => tick + 1);
      return;
    }

    setMessages([]);
    setSaving(true);
    try {
      await onSave({ intent, items });
    } catch (err) {
      setMessages([err?.message || 'Could not save the study pack. Please try again.']);
      setSaving(false);
      setBannerTick((tick) => tick + 1);
    }
  }

  // ── What to show ──────────────────────────────────────────────────────

  const found = result?.status === 'found' ? result.recording : null;

  let mismatch = null;
  if (found) {
    const otherTeacher = Boolean(form.teacherId) && String(found.teacherId) !== String(form.teacherId);
    const otherSubject = Boolean(form.subject) && found.subject !== form.subject;
    if (otherTeacher || otherSubject) {
      mismatch = {
        recording: joinParts(teacherName(teachers, found.teacherId), found.subject),
        pack: joinParts(teacherName(teachers, form.teacherId), form.subject),
      };
    }
  }

  const codeState =
    result?.status === 'found'
      ? 'found'
      : result && ['empty', 'notfound', 'error'].includes(result.status)
        ? 'invalid'
        : 'idle';

  const nextNumber = items.length + 1;
  const subline = joinParts(form.name, teacherName(teachers, form.teacherId), form.subject);

  return (
    <div className={base.page}>
      <div className={base.formHeader}>
        <div className={base.formHeaderLeft}>
          <button type="button" className={s.backMuted} onClick={() => onCancel()}>
            <Icon name="arrow_back" size={18} weight={600} />
            All study packs
          </button>
          <div>
            <h1 className={base.h1}>Add recordings</h1>
            {subline ? <p className={base.subtitle}>{subline}</p> : null}
          </div>
        </div>
        <StepMarker step={2} onGoToSettings={onBackToSettings} />
      </div>

      <Toast message={toast} />

      {messages.length > 0 ? (
        <div ref={bannerRef} className={base.banner} role="alert">
          <Icon name="error" size={22} fill={1} />
          <div className={base.bannerText}>
            {messages.map((message) => (
              <span key={message}>{message}</span>
            ))}
          </div>
        </div>
      ) : null}

      <div className={base.formLayout}>
        <div className={base.formMain}>
          <section className={base.formCard}>
            <header className={base.sectionHeader}>
              <span className={base.sectionIcon} aria-hidden="true">
                <Icon name="add_link" size={19} />
              </span>
              <div className={base.sectionText}>
                <h2 className={base.sectionTitle}>Add a recording</h2>
                <p className={base.sectionSubtitle}>
                  Paste the code of a recording from Class Recordings. Add one at a time.
                </p>
              </div>
            </header>

            <RecordingCodeInput
              value={code}
              onChange={handleCodeChange}
              onSubmit={() => lookup(code)}
              onPasteText={(text) => lookup(text)}
              onPasteClick={handlePasteButton}
              state={codeState}
              looking={looking}
              pasteHint={pasteHint}
              inputRef={codeRef}
            />

            <RecordingLookupResult result={result} mismatch={mismatch} teachers={teachers} />

            <LessonTitleField
              value={title}
              onChange={handleTitleChange}
              onEnter={handleAdd}
              error={titleError}
              recording={found}
              onUseTitle={handleUseTitle}
              inputRef={titleRef}
            />

            <div className={s.buttonRow}>
              <button type="button" className={base.neutralButton} onClick={handleClear}>
                Clear
              </button>
              <button type="button" className={base.primaryButton} onClick={handleAdd} disabled={looking}>
                <Icon name="playlist_add" size={18} weight={600} />
                {mismatch ? `Add anyway as session ${nextNumber}` : `Add as session ${nextNumber}`}
              </button>
            </div>
          </section>

          <SessionList
            items={items}
            justAdded={justAdded}
            showErrors={saveAttempted}
            undo={undo}
            onUndo={handleUndo}
            onTitleChange={handleSessionTitle}
            onMove={handleMove}
            onRemove={handleRemove}
          />
        </div>

        <aside className={base.formAside}>
          <PackSummaryAside
            form={form}
            status={live ? 'published' : 'draft'}
            items={items}
            teachers={teachers}
            onEditSettings={onBackToSettings}
          />
        </aside>
      </div>

      <ActionBar
        step={2}
        live={live}
        saving={saving}
        onCancel={() => onCancel()}
        onSave={() => handleAction('save')}
        onPublish={() => handleAction('publish')}
      />
    </div>
  );
}
