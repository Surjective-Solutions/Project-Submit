'use client';

import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { getPackItems, getPacks, getTeachers, savePackWithSessions } from '@/study-packs/api';
import { formToValues, packToForm, teacherName } from '@/study-packs/utils';
import AddRecordingsPage from './AddRecordingsPage';
import PackCard from './PackCard';
import PackFilters from './PackFilters';
import StudyPackForm from './StudyPackForm';
import Toast from './Toast';
import styles from './study-packs.module.css';

const TOAST_MS = 6000;

function revokeBlob(url) {
  if (typeof url === 'string' && url.startsWith('blob:')) URL.revokeObjectURL(url);
}

export default function StudyPacksPage() {
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

  const [toast, setToast] = useState(null); // { id, message }

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
  }, []);

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
      if (!query) return true;
      return (
        pack.name.toLowerCase().includes(query) ||
        teacherName(teachers, pack.teacherId).toLowerCase().includes(query)
      );
    });
  }, [packs, teachers, status, subject, search]);

  const editingPack = packs.find((p) => p.id === editingId) ?? null;
  const filtersActive = status !== 'all' || subject !== '' || search.trim() !== '';

  function openCreate() {
    setEditingId(null);
    setDraft({ form: packToForm(null), coverFile: null, items: [] });
    setView('settings');
  }

  function openEdit(pack) {
    setEditingId(pack.id);
    setDraft({ form: packToForm(pack), coverFile: null, items: getPackItems(pack) });
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
          <PackCard key={pack.id} pack={pack} teachers={teachers} onEdit={openEdit} />
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
        <button type="button" className={styles.primaryButton} onClick={openCreate}>
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
      />

      {listContent}
    </div>
  );
}
