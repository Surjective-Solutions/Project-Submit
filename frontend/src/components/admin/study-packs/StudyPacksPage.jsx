'use client';

import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { createPack, getPacks, getTeachers, updatePack } from '@/study-packs/api';
import { teacherName } from '@/study-packs/utils';
import PackCard from './PackCard';
import PackFilters from './PackFilters';
import StudyPackForm from './StudyPackForm.jsx';
import Toast from './Toast';
import styles from './study-packs.module.css';

const TOAST_MS = 6000;

export default function StudyPacksPage() {
  const [packs, setPacks] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingId, setEditingId] = useState(null);

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
    setView('form');
  }

  function openEdit(pack) {
    setEditingId(pack.id);
    setView('form');
  }

  function closeForm() {
    setView('list');
    setEditingId(null);
  }

  // Throws when the save fails, so the form stays open and shows the message.
  async function handleSave({ intent, values, coverFile, removeCover }) {
    const publish = intent === 'publish';
    const saved = editingPack
      ? await updatePack(editingPack.id, values, { coverFile, removeCover, publish })
      : await createPack(values, { coverFile, publish });

    setPacks((prev) => (editingPack ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev]));

    let message;
    if (editingPack) {
      message =
        editingPack.status === 'draft' && publish
          ? `“${saved.name}” saved and published.`
          : `Changes to “${saved.name}” saved.`;
    } else if (publish) {
      message = `“${saved.name}” is published and students can buy it now. Next, add class recordings to it.`;
    } else {
      message = `“${saved.name}” saved as a draft. Next, add class recordings, then publish when ready.`;
    }

    // back to the full list so the saved pack is visible
    setStatus('all');
    setSearch('');
    setSubject('');
    closeForm();
    setToast({ id: Date.now(), message });
  }

  if (view === 'form') {
    return (
      <StudyPackForm
        key={editingId ?? 'new'}
        pack={editingPack}
        teachers={teachers}
        onCancel={closeForm}
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
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Study Packs</h2>
          <p className={styles.subtitle}>
            Bundles of past class recordings for one lesson or unit, so students who join late can catch up on what
            they missed.
          </p>
        </div>
        <button type="button" className={styles.primaryButton} onClick={openCreate}>
          <Icon name="add" size={20} weight={600} />
          New study pack
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
