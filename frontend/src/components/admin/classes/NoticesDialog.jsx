'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/admin/Icon';
import { classes as classesApi } from '@/classes/api';
import { audienceCount, audienceInfo, categoryInfo, sortNotices } from '@/classes/noticeUtils';
import { formatDateTime } from '@/classes/sessionUtils';
import { plural } from '@/classes/utils';
import ConfirmDialog from './ConfirmDialog';
import Dialog from './Dialog';
import NoticeFormDialog from './NoticeFormDialog';
import styles from './classes.module.css';
import s from './sessions.module.css';

// The notices of one class. What is published here appears in the notification centre of the enrolled students.
// The list is newest first; notices are written in a window of their own and can be edited or deleted.
export default function NoticesDialog({ classId, className, enrollments, onClose }) {
  const [state, setState] = useState({ status: 'loading', items: [] });
  const [form, setForm] = useState(null); // { mode: 'create' } or { mode: 'edit', id }
  const [removing, setRemoving] = useState(null); // { notice, busy, error }
  const mounted = useRef(true);

  const load = useCallback(() => {
    setState({ status: 'loading', items: [] });
    classesApi
      .notices(classId)
      .then((items) => mounted.current && setState({ status: 'ready', items }))
      .catch(() => mounted.current && setState({ status: 'error', items: [] }));
  }, [classId]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const items = sortNotices(state.items);
  const editingNotice = form?.mode === 'edit' ? state.items.find((n) => n.id === form.id) : null;

  async function save(payload) {
    if (form.mode === 'create') {
      const { notice } = await classesApi.createNotice(classId, payload);
      setState((current) => ({ ...current, items: [...current.items, notice] }));
      toast.success(`Notice published to ${plural(audienceCount(enrollments, notice.audience), 'student')}.`);
    } else {
      const { notice } = await classesApi.updateNotice(classId, form.id, payload);
      setState((current) => ({ ...current, items: current.items.map((n) => (n.id === notice.id ? notice : n)) }));
      toast.success('Notice updated.');
    }
    setForm(null);
  }

  async function confirmRemove() {
    const { notice } = removing;
    setRemoving({ notice, busy: true, error: '' });
    try {
      await classesApi.deleteNotice(classId, notice.id);
      if (!mounted.current) return;
      setState((current) => ({ ...current, items: current.items.filter((n) => n.id !== notice.id) }));
      setRemoving(null);
      toast.success(`“${notice.title}” deleted.`);
    } catch {
      if (mounted.current) setRemoving({ notice, busy: false, error: 'Couldn’t delete the notice. Check the connection and try again.' });
    }
  }

  return (
    <>
      <Dialog
        title="Notices"
        titleId="notices-title"
        icon="campaign"
        size="xl"
        onClose={onClose}
        footer={
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={s.panel}>
          <div className={s.noticesHead}>
            <p className={s.noticesIntro}>
              <strong>{className}</strong>
              <span>Notices appear in the notification centre of the students who are enrolled in this class.</span>
            </p>
            <button type="button" className={styles.primaryButton} onClick={() => setForm({ mode: 'create' })} data-autofocus>
              <Icon name="add" size={20} weight={600} />
              New notice
            </button>
          </div>

          {state.status === 'loading' && (
            <div className={s.noticeList} role="status" aria-busy="true" aria-label="Loading notices">
              <div className={styles.skeleton} style={{ minHeight: 110 }} />
              <div className={styles.skeleton} style={{ minHeight: 110 }} />
            </div>
          )}

          {state.status === 'error' && (
            <div className={styles.errorBox} role="alert">
              <Icon name="error" size={20} weight={600} fill={1} />
              <span className={styles.errorText}>Couldn’t load the notices.</span>
              <button type="button" className={styles.secondaryButton} onClick={load}>
                <Icon name="refresh" size={18} weight={600} />
                Try again
              </button>
            </div>
          )}

          {state.status === 'ready' &&
            (items.length === 0 ? (
              <div className={s.resourceEmpty} role="status" data-testid="notices-empty">
                <Icon name="campaign" size={26} weight={400} />
                <p>No notices yet. Use “New notice” to tell the students about a change or an update.</p>
              </div>
            ) : (
              <ul className={s.noticeList} aria-label="Published notices">
                {items.map((notice) => {
                  const category = categoryInfo(notice.category);
                  return (
                    <li key={notice.id} className={s.notice}>
                      <span className={s.resourceIcon} aria-hidden="true">
                        <Icon name={category.icon} size={21} weight={500} />
                      </span>
                      <div className={s.noticeMain}>
                        <div className={s.noticeTop}>
                          <span className={s.noticeKind}>{category.label}</span>
                          <span className={s.noticeActions}>
                            <button
                              type="button"
                              className={s.rowButton}
                              onClick={() => setForm({ mode: 'edit', id: notice.id })}
                              aria-label={`Edit notice ${notice.title}`}
                            >
                              <Icon name="edit" size={19} weight={500} />
                            </button>
                            <button
                              type="button"
                              className={`${s.rowButton} ${s.rowButtonDanger}`}
                              onClick={() => setRemoving({ notice, busy: false, error: '' })}
                              aria-label={`Delete notice ${notice.title}`}
                            >
                              <Icon name="delete" size={19} weight={500} />
                            </button>
                          </span>
                        </div>
                        <h3 className={s.noticeTitle}>{notice.title}</h3>
                        <p className={s.noticeBody}>{notice.body}</p>
                        <p className={s.noticeMeta}>
                          <span>
                            {formatDateTime(notice.publishedAt)} · {notice.author}
                          </span>
                          {notice.updatedAt && <span data-testid="notice-edited">Edited {formatDateTime(notice.updatedAt)}</span>}
                          <span>
                            Sent to {audienceInfo(notice.audience).label.toLowerCase()} ({audienceCount(enrollments, notice.audience)})
                          </span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ))}
        </div>
      </Dialog>

      {form && (form.mode === 'create' || editingNotice) && (
        <NoticeFormDialog
          key={form.mode === 'edit' ? form.id : 'new'}
          notice={editingNotice}
          className={className}
          enrollments={enrollments}
          onSave={save}
          onClose={() => setForm(null)}
        />
      )}

      {removing && (
        <ConfirmDialog
          title="Delete notice?"
          message={`“${removing.notice.title}” will be deleted and removed from the notification centre of the students it was sent to. This can’t be undone.`}
          confirmLabel="Delete notice"
          busy={removing.busy}
          error={removing.error}
          onConfirm={confirmRemove}
          onCancel={() => setRemoving(null)}
        />
      )}
    </>
  );
}
