'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { NOTICE_AUDIENCES, NOTICE_BODY_MAX, NOTICE_CATEGORIES, NOTICE_TITLE_MAX } from '@/classes/constants';
import {
  NOTICE_ERRORS,
  audienceCount,
  audienceInfo,
  categoryInfo,
  emptyNoticeForm,
  noticeIsDirty,
  noticeToForm,
  noticeToPayload,
  validateNotice,
} from '@/classes/noticeUtils';
import { plural } from '@/classes/utils';
import ConfirmDialog from './ConfirmDialog';
import Dialog from './Dialog';
import { ChoiceGroup, Field, SelectBox } from './FormParts';
import styles from './classes.module.css';
import s from './sessions.module.css';

// Write or edit one notice. `notice` is given when editing. `enrollments` are the class's numbers, to say how
// many students a notice reaches. onSave(payload) must return a promise; if it rejects the dialog stays open.
// Closing asks first when something has been typed.
export default function NoticeFormDialog({ notice = null, className, enrollments, onSave, onClose }) {
  const editing = !!notice;
  const initial = useMemo(() => (editing ? noticeToForm(notice) : emptyNoticeForm()), [editing, notice]);
  const [form, setForm] = useState(initial);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const { errors, count } = validateNotice(form);
  const show = (key) => attempted && errors[key];
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const dirty = noticeIsDirty(form, initial);
  const reach = audienceCount(enrollments, form.audience);
  const category = categoryInfo(form.category);

  function requestClose() {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  }

  async function submit() {
    if (saving) return;
    setAttempted(true);
    setSaveError('');
    const check = validateNotice(form);
    if (check.count > 0) {
      document.getElementById(check.errors.title ? 'notice-title' : 'notice-body')?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSave(noticeToPayload(form));
    } catch {
      if (mounted.current) {
        setSaving(false);
        setSaveError(`Couldn’t ${editing ? 'save' : 'publish'} the notice. Check the connection and try again.`);
      }
    }
  }

  const footer = (
    <>
      <button type="button" className={styles.secondaryButton} onClick={requestClose} disabled={saving}>
        Cancel
      </button>
      <button type="button" className={styles.primaryButton} onClick={submit} disabled={saving}>
        {saving
          ? editing
            ? 'Saving…'
            : 'Publishing…'
          : editing
            ? 'Save changes'
            : `Publish to ${plural(reach, 'student')}`}
      </button>
    </>
  );

  return (
    <>
      <Dialog
        title={editing ? 'Edit notice' : 'New notice'}
        titleId="notice-form-title"
        icon={editing ? 'edit_note' : 'campaign'}
        size="xl"
        closeOnOverlay={false}
        onClose={requestClose}
        footer={footer}
      >
        <div className={s.panel}>
          {(saveError || (attempted && count > 0)) && (
            <div className={styles.errorBox} role="alert">
              <Icon name="error" size={20} weight={600} fill={1} />
              <span className={styles.errorText}>
                {saveError || `Fix ${count} ${count === 1 ? 'thing' : 'things'} to ${editing ? 'save' : 'publish'} this notice.`}
              </span>
            </div>
          )}

          <Field id="notice-category" label="Type">
            <SelectBox id="notice-category" value={form.category} onChange={(event) => set({ category: event.target.value })}>
              {NOTICE_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </SelectBox>
          </Field>

          <Field id="notice-title" label="Title" required error={show('title') && NOTICE_ERRORS.title}>
            <input
              id="notice-title"
              className={`${s.input} ${show('title') ? s.inputError : ''}`}
              type="text"
              value={form.title}
              maxLength={NOTICE_TITLE_MAX}
              placeholder="e.g. This Saturday’s class is at Hall B"
              autoComplete="off"
              data-autofocus
              onChange={(event) => set({ title: event.target.value })}
            />
          </Field>

          <Field id="notice-body" label="Message" required error={show('body') && NOTICE_ERRORS.body}>
            <textarea
              id="notice-body"
              className={`${s.textarea} ${show('body') ? s.inputError : ''}`}
              rows={5}
              value={form.body}
              maxLength={NOTICE_BODY_MAX}
              placeholder="What do the students need to know?"
              onChange={(event) => set({ body: event.target.value })}
            />
            <span className={s.counter} aria-hidden="true">
              {form.body.length}/{NOTICE_BODY_MAX}
            </span>
          </Field>

          {editing ? (
            <div className={styles.field}>
              <span className={styles.label}>Sent to</span>
              <p className={s.audienceFixed} data-testid="notice-audience-fixed">
                <Icon name="groups" size={19} weight={500} />
                <span>
                  {audienceInfo(form.audience).label} · {plural(reach, 'student')}
                </span>
              </p>
              <p className={s.hint}>The audience can’t be changed after a notice is published. Students see your changes.</p>
            </div>
          ) : (
            <ChoiceGroup
              legend="Send to"
              name="notice-audience"
              options={NOTICE_AUDIENCES.map((item) => ({
                value: item.value,
                label: item.label,
                hint: plural(audienceCount(enrollments, item.value), 'student'),
              }))}
              value={form.audience}
              onChange={(audience) => set({ audience })}
            />
          )}

          <section className={s.block} aria-labelledby="notice-preview-title">
            <h3 id="notice-preview-title" className={s.blockTitle}>
              How students will see it
            </h3>
            <p className={s.hint}>It appears in the notification centre of each student it is sent to.</p>
            <div className={s.pv} data-testid="notice-preview" aria-label="Preview of the notification">
              <span className={s.pvIcon} aria-hidden="true">
                <Icon name={category.icon} size={22} weight={500} />
              </span>
              <span className={s.pvText}>
                <span className={s.pvTop}>
                  <span className={s.pvKind}>{category.label}</span>
                  <span className={s.pvTime}>{editing ? 'Updated just now' : 'Just now'}</span>
                </span>
                <span className={`${s.pvTitle} ${form.title.trim() ? '' : s.pvEmpty}`}>{form.title.trim() || 'Notice title'}</span>
                <span className={`${s.pvBody} ${form.body.trim() ? '' : s.pvEmpty}`}>{form.body.trim() || 'Your message will appear here.'}</span>
                <span className={s.pvClass}>{className}</span>
              </span>
            </div>
          </section>
        </div>
      </Dialog>

      {confirmDiscard && (
        <ConfirmDialog
          title="Discard this notice?"
          message={editing ? 'Your changes to this notice haven’t been saved.' : 'This notice hasn’t been published. If you discard it, what you wrote is lost.'}
          confirmLabel="Discard"
          cancelLabel="Keep editing"
          icon="edit_off"
          onConfirm={onClose}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </>
  );
}
