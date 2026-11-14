'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/admin/Icon';
import { classes as classesApi, halls as hallsApi } from '@/classes/api';
import {
  defaultMonth,
  formatMonth,
  monthOf,
  sessionsInMonth,
  sortSessions,
} from '@/classes/sessionUtils';
import { classTitle, plural, tutorHref } from '@/classes/utils';
import ClassEditDialog from './ClassEditDialog';
import ClassOverview from './ClassOverview';
import ClassPanelDialog from './ClassPanelDialog';
import ManageStudentsDialog from './ManageStudentsDialog';
import NoticesDialog from './NoticesDialog';
import ConfirmDialog from './ConfirmDialog';
import MonthPicker from './MonthPicker';
import ParticipantsDialog from './ParticipantsDialog';
import ResourcesDialog from './ResourcesDialog';
import SessionDialog from './SessionDialog';
import SessionsTable from './SessionsTable';
import styles from './classes.module.css';
import s from './sessions.module.css';

// One class: enrollment numbers at the top, then its sessions. Sessions are created, edited and deleted here.
export default function ClassDetailPage({ tutorId, classId }) {
  const [data, setData] = useState({ status: 'loading', cls: null, sessions: [], halls: [] });
  const [dialog, setDialog] = useState(null); // { mode: 'create' } or { mode: 'edit', id }
  const [participantsId, setParticipantsId] = useState(null);
  const [resourcesId, setResourcesId] = useState(null);
  const [editingClass, setEditingClass] = useState(false);
  const [panel, setPanel] = useState(null); // 'notices' | 'students' | 'analytics'
  const [period, setPeriod] = useState(() => defaultMonth([], new Date())); // the month of sessions being shown
  const [removing, setRemoving] = useState(null); // { session, busy, error }
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    window.scrollTo?.(0, 0);
    document.querySelector('main')?.scrollTo?.(0, 0);
  }, [classId]);

  const load = useCallback(() => {
    setData({ status: 'loading', cls: null, sessions: [], halls: [] });
    let cancelled = false;
    Promise.all([classesApi.get(classId), classesApi.sessions(classId), hallsApi.list()])
      .then(([cls, sessions, halls]) => {
        if (cancelled) return;
        const found = cls && cls.tutorId === String(tutorId) ? cls : null;
        setData({ status: found ? 'ready' : 'missing', cls: found, sessions, halls });
        setPeriod(defaultMonth(sessions, new Date()));
      })
      .catch(() => !cancelled && setData({ status: 'error', cls: null, sessions: [], halls: [] }));
    return () => {
      cancelled = true;
    };
  }, [classId, tutorId]);
  useEffect(() => load(), [load]);

  const { cls, halls } = data;
  const sessions = useMemo(() => sortSessions(sessionsInMonth(data.sessions, period)), [data.sessions, period]);
  const participantsSession = participantsId ? data.sessions.find((x) => x.id === participantsId) : null;
  const resourcesSession = resourcesId ? data.sessions.find((x) => x.id === resourcesId) : null;
  const editingSession = dialog?.mode === 'edit' ? data.sessions.find((x) => x.id === dialog.id) : null;

  async function saveClass(payload) {
    const { cls: updated } = await classesApi.update(classId, payload);
    setData((current) => ({ ...current, cls: updated }));
    setEditingClass(false);
    toast.success('Class saved.');
  }

  function openOption(key) {
    if (key === 'edit') setEditingClass(true);
    else setPanel(key);
  }

  function setResourceCount(sessionId, count) {
    setData((current) => ({
      ...current,
      sessions: current.sessions.map((x) => (x.id === sessionId ? { ...x, resourceCount: count } : x)),
    }));
  }

  async function saveSession(payload) {
    if (dialog.mode === 'create') {
      const { session } = await classesApi.createSession(classId, payload);
      setData((current) => ({ ...current, sessions: [...current.sessions, session] }));
      setPeriod(monthOf(session.startsAt) || period); // show the month the new session is in
      toast.success(`“${session.name}” created.`);
    } else {
      const { session } = await classesApi.updateSession(classId, dialog.id, payload);
      setData((current) => ({ ...current, sessions: current.sessions.map((x) => (x.id === session.id ? session : x)) }));
      setPeriod(monthOf(session.startsAt) || period);
      toast.success(`“${session.name}” saved.`);
    }
    setDialog(null);
  }

  async function confirmDelete() {
    const { session } = removing;
    setRemoving({ session, busy: true, error: '' });
    try {
      await classesApi.deleteSession(classId, session.id);
      setData((current) => ({ ...current, sessions: current.sessions.filter((x) => x.id !== session.id) }));
      setRemoving(null);
      toast.success(`“${session.name}” deleted.`);
    } catch {
      setRemoving({ session, busy: false, error: 'Couldn’t delete the session. Check the connection and try again.' });
    }
  }

  return (
    <div className={styles.page}>
      <Link href={cls ? tutorHref(cls.tutorId) : tutorHref(tutorId)} className={styles.backLink}>
        <Icon name="arrow_back" size={18} weight={600} />
        {cls ? cls.tutor.name : 'Back to the tutor'}
      </Link>

      {data.status === 'loading' && (
        <div aria-busy="true" role="status" aria-label="Loading class" className={styles.detailSkeleton}>
          <div className={styles.skeleton} style={{ minHeight: 130 }} />
          <div className={styles.skeleton} style={{ minHeight: 90 }} />
          <div className={styles.skeleton} style={{ minHeight: 260 }} />
        </div>
      )}

      {data.status === 'error' && (
        <div className={styles.errorBox} role="alert">
          <Icon name="error" size={20} weight={600} fill={1} />
          <span className={styles.errorText}>Couldn’t load this class. Check the connection and try again.</span>
          <button type="button" className={styles.secondaryButton} onClick={load}>
            <Icon name="refresh" size={18} weight={600} />
            Try again
          </button>
        </div>
      )}

      {data.status === 'missing' && (
        <div className={styles.empty} role="status">
          This class could not be found.
        </div>
      )}

      {data.status === 'ready' && (
        <>
          <ClassOverview cls={cls} onCreateSession={() => setDialog({ mode: 'create' })} onOption={openOption} />

          <section className={s.card} aria-labelledby="sessions-title">
            <header className={s.cardHeader}>
              <div className={s.cardHeading}>
                <h2 id="sessions-title" className={s.cardTitle}>
                  Sessions
                </h2>
                <span className={s.cardCount}>
                  {plural(sessions.length, 'session')} in {formatMonth(period)}
                </span>
              </div>
              {data.sessions.length > 0 && <MonthPicker sessions={data.sessions} period={period} onChange={setPeriod} />}
            </header>

            {sessions.length === 0 ? (
              <div className={s.emptyBox} role="status">
                <Icon name="event_note" size={28} weight={400} />
                <p className={s.emptyTitle}>
                  {data.sessions.length === 0 ? 'No sessions yet' : `No sessions in ${formatMonth(period)}`}
                </p>
                <p className={s.emptyText}>
                  {data.sessions.length === 0
                    ? 'Create the first session for this class.'
                    : 'Pick another month above, or create a session.'}
                </p>
                <button type="button" className={styles.primaryButton} onClick={() => setDialog({ mode: 'create' })}>
                  <Icon name="add" size={20} weight={600} />
                  Create session
                </button>
              </div>
            ) : (
              <SessionsTable
                sessions={sessions}
                now={now}
                onEdit={(session) => setDialog({ mode: 'edit', id: session.id })}
                onParticipants={(session) => setParticipantsId(session.id)}
                onResources={(session) => setResourcesId(session.id)}
                onDelete={(session) => setRemoving({ session, busy: false, error: '' })}
              />
            )}
          </section>
        </>
      )}

      {dialog && (dialog.mode === 'create' || editingSession) && (
        <SessionDialog
          key={dialog.mode === 'edit' ? dialog.id : 'new'}
          session={editingSession}
          halls={halls}
          classInfo={{ subject: cls.tutor.subject }}
          onSave={saveSession}
          onClose={() => setDialog(null)}
        />
      )}

      {participantsSession && <ParticipantsDialog key={participantsSession.id} classId={classId} session={participantsSession} onClose={() => setParticipantsId(null)} />}

      {resourcesSession && (
        <ResourcesDialog
          key={resourcesSession.id}
          classId={classId}
          session={resourcesSession}
          onCountChange={(count) => setResourceCount(resourcesSession.id, count)}
          onClose={() => setResourcesId(null)}
        />
      )}

      {editingClass && <ClassEditDialog cls={cls} now={now} onSave={saveClass} onClose={() => setEditingClass(false)} />}

      {panel === 'notices' && (
        <NoticesDialog classId={classId} className={classTitle(cls, cls.tutor)} enrollments={cls.enrollments} onClose={() => setPanel(null)} />
      )}

      {panel === 'students' && (
        <ManageStudentsDialog
          classId={classId}
          className={classTitle(cls, cls.tutor)}
          onEnrollmentsChange={(enrollments) => setData((current) => ({ ...current, cls: { ...current.cls, enrollments } }))}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === 'analytics' && <ClassPanelDialog panel={panel} name={classTitle(cls, cls.tutor)} onClose={() => setPanel(null)} />}

      {removing && (
        <ConfirmDialog
          title="Delete session?"
          message={`“${removing.session.name}” will be deleted, including its recording link, resources, revenue shares and attendance. This can’t be undone.`}
          confirmLabel="Delete session"
          busy={removing.busy}
          error={removing.error}
          onConfirm={confirmDelete}
          onCancel={() => setRemoving(null)}
        />
      )}
    </div>
  );
}
