'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import Icon from '@/components/admin/Icon';
import * as adminApi from '@/study-packs/api';
import { GRADES } from '@/study-packs/constants';
import { gradeAllowed, parseExamLevels } from '@/study-packs/examLevel';
import { formToValues, packToForm, teacherName } from '@/study-packs/utils';
import AddRecordingsPage from './AddRecordingsPage';
import PackCard from './PackCard';
import PackDetail from './PackDetail';
import PackFilters from './PackFilters';
import StudyPackForm from './StudyPackForm';
import Toast from './Toast';
import styles from './study-packs.module.css';

const TOAST_MS = 6000;

// Runs a state change as a smooth "shared element" transition (a pack card growing into its detail view) when the
// browser supports View Transitions; otherwise, or with reduced motion, the change just happens.
function morph(update) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (typeof document.startViewTransition === 'function' && !reduce) {
    document.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}

function revokeBlob(url) {
  if (typeof url === 'string' && url.startsWith('blob:')) URL.revokeObjectURL(url);
}

// `api` is where the packs come from. The admin page uses the admin API (every pack, every teacher). The teacher page
// passes study-packs/teacherApi.js and `ownTeacher`: the packs are then only that teacher's, the teacher and subject are
// fixed to them (the form doesn't ask), and the recordings step only accepts their own recordings.
export default function StudyPacksPage({ api = adminApi, ownTeacher = false }) {
  const { getPackItems, getPacks, getTeachers, savePackWithSessions } = api;
  const [packs, setPacks] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // 'list' | 'settings' (step 1) | 'recordings' (step 2)
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  // The pack being built or edited: { form, coverFile, items }. It lives only in memory
  // and is saved from step 2; leaving the flow without saving throws it away.
  const [draft, setDraft] = useState(null);

  const [status, setStatus] = useState('all'); // 'all' | 'published' | 'draft'
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [batch, setBatch] = useState(''); // teacher account only: filters by grade / batch instead of subject

  const [toast, setToast] = useState(null); // { id, message }
  const [detailId, setDetailId] = useState(null); // the pack card that is open as a detail view

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [loadedPacks, loadedTeachers] = await Promise.all([getPacks(), getTeachers()]);
        if (cancelled) return;
        setPacks(loadedPacks);
        setTeachers(loadedTeachers);
      } catch (err) {
        if (!cancelled) setLoadError(err?.message || 'Could not load study packs.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [getPacks, getTeachers]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  const counts = useMemo(
    () => ({
      all: packs.length,
      published: packs.filter((p) => p.status === 'published').length,
      draft: packs.filter((p) => p.status === 'draft').length,
    }),
    [packs]
  );

  const visiblePacks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return packs.filter((pack) => {
      if (status !== 'all' && pack.status !== status) return false;
      if (subject && pack.subject !== subject) return false;
      if (batch && pack.grade !== batch) return false;
      if (!query) return true;
      return (
        pack.name.toLowerCase().includes(query) ||
        teacherName(teachers, pack.teacherId).toLowerCase().includes(query)
      );
    });
  }, [packs, teachers, status, subject, batch, search]);

  const editingPack = packs.find((p) => p.id === editingId) ?? null;
  const detailPack = packs.find((p) => p.id === detailId) ?? null;

  // In the teacher account the only "teacher" is the signed-in one; their id and subject go into every form.
  const lockedTeacher = ownTeacher ? (teachers[0] ?? null) : null;
  // A grade of the wrong exam level (an O/L grade for an A/L teacher) is cleared, so they have to pick one of their own.
  const lockForm = (form) => {
    if (!lockedTeacher) return form;
    const grade = gradeAllowed(form.grade, parseExamLevels(lockedTeacher.examLevel)) ? form.grade : '';
    return { ...form, grade, teacherId: String(lockedTeacher.id), subject: lockedTeacher.subject || form.subject };
  };
  // The batches the teacher can filter by: the grades of their own exam level.
  const batchOptions = ownTeacher
    ? GRADES.filter((grade) => gradeAllowed(grade, parseExamLevels(lockedTeacher?.examLevel)))
    : null;
  const filtersActive = status !== 'all' || subject !== '' || batch !== '' || search.trim() !== '';

  function openCreate() {
    setEditingId(null);
    setDraft({ form: lockForm(packToForm(null)), coverFile: null, items: [] });
    setView('settings');
  }

  // Clicking a card opens its detail view; Edit inside it goes on to the form.
  const openDetail = (pack) => morph(() => setDetailId(pack.id));
  const closeDetail = useCallback(() => morph(() => setDetailId(null)), []);

  function openEdit(pack) {
    setDetailId(null);
    setEditingId(pack.id);
    setDraft({ form: lockForm(packToForm(pack)), coverFile: null, items: getPackItems(pack) });
    setView('settings');
  }

  // Leave the flow without saving. `liveCoverUrl` is the cover preview step 1 is showing right now.
  function discardDraft(liveCoverUrl) {
    revokeBlob(draft?.form.coverUrl);
    revokeBlob(liveCoverUrl);
    setDraft(null);
    setEditingId(null);
    setView('list');
  }

  // Step 1 -> step 2: keep the settings in the draft.
  function handleNext({ form, coverFile }) {
    setDraft((prev) => ({ ...prev, form, coverFile }));
    setView('recordings');
  }

  // Step 2 -> step 1: the sessions stay in the draft.
  function handleBackToSettings() {
    setView('settings');
  }

  function handleItemsChange(next) {
    setDraft((prev) => ({ ...prev, items: typeof next === 'function' ? next(prev.items) : next }));
  }

  // Throws when the save fails, so step 2 stays open and shows the message.
  async function handleSave({ intent, items }) {
    const publish = intent === 'publish';
    const saved = await savePackWithSessions(
      {
        id: editingPack?.id ?? null,
        values: formToValues(draft.form),
        items: items.map(({ recordingCode, title, order }) => ({ recordingCode, title, order })),
        coverFile: draft.coverFile,
        // an existing cover was taken away and nothing replaced it
        removeCover: Boolean(editingPack?.coverUrl) && !draft.form.coverUrl,
      },
      { publish }
    );

    setPacks((prev) => (editingPack ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev]));

    const noun = saved.sessions === 1 ? 'session' : 'sessions';
    const message =
      saved.status === 'published' && publish
        ? `“${saved.name}” is published with ${saved.sessions} ${noun}. Students can buy it now.`
        : `“${saved.name}” saved with ${saved.sessions} ${noun}.`;

    // back to the full list so the saved pack is visible
    setStatus('all');
    setSearch('');
    setSubject('');
    setBatch('');
    discardDraft();
    setToast({ id: Date.now(), message });
  }

  if (view === 'settings' && draft) {
    return (
      <StudyPackForm
        key={editingId ?? 'new'}
        pack={editingPack}
        draft={draft}
        teachers={teachers}
        lockedTeacher={lockedTeacher}
        onCancel={discardDraft}
        onNext={handleNext}
      />
    );
  }

  if (view === 'recordings' && draft) {
    return (
      <AddRecordingsPage
        key={editingId ?? 'new'}
        pack={editingPack}
        draft={draft}
        teachers={teachers}
        lookupRecording={api.getRecordingByCode}
        canPublish={!ownTeacher}
        onItemsChange={handleItemsChange}
        onBackToSettings={handleBackToSettings}
        onCancel={() => discardDraft()}
        onSave={handleSave}
      />
    );
  }

  let listContent;
  if (loading) {
    listContent = <div className={styles.emptyBox}>Loading study packs…</div>;
  } else if (loadError) {
    listContent = <div className={styles.emptyBox}>{loadError}</div>;
  } else if (visiblePacks.length === 0) {
    listContent = (
      <div className={styles.emptyBox}>
        {filtersActive || packs.length > 0
          ? 'No study packs match these filters.'
          : 'No study packs yet. Create the first one.'}
      </div>
    );
  } else {
    listContent = (
      <div className={styles.grid}>
        {visiblePacks.map((pack) => (
          <div
            key={pack.id}
            className="pack-slot"
            // the open card gives its name to the detail view, so the two can morph into each other
            style={detailId === pack.id ? undefined : { viewTransitionName: `pack-${pack.id}`, viewTransitionClass: 'pack-vt' }}
          >
            <PackCard pack={pack} teachers={teachers} onEdit={openDetail} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.headerText}>
          <h1 className={styles.h1}>Study Packs</h1>
          <p className={styles.subtitle}>
            Bundles of past class recordings for one lesson or unit, so students who join late can catch up on what
            they missed.
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={openCreate}
          disabled={ownTeacher && !lockedTeacher}
        >
          <Icon name="add" size={18} weight={600} />
          Create study pack
        </button>
      </div>

      <Toast message={toast?.message} />

      <PackFilters
        status={status}
        onStatusChange={setStatus}
        counts={counts}
        search={search}
        onSearchChange={setSearch}
        subject={subject}
        onSubjectChange={setSubject}
        batchOptions={batchOptions}
        batch={batch}
        onBatchChange={setBatch}
        searchLabel={ownTeacher ? 'Search your packs' : undefined}
      />

      {listContent}

      {detailPack ? (
        <PackDetail
          key={detailPack.id}
          pack={detailPack}
          teachers={teachers}
          items={getPackItems(detailPack)}
          onClose={closeDetail}
          onEdit={openEdit}
        />
      ) : null}
    </div>
  );
}
