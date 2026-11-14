'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import {
  BANNER_TYPES,
  CLASS_INFO_MAX,
  CLASS_NAME_MAX,
  PAYMENT_FORMATS,
  TRAILER_TYPES,
  VISIBILITY,
  WEEKDAYS,
} from '@/classes/constants';
import {
  CLASS_ERRORS,
  CLASS_FIELD_ORDER,
  autoName,
  batchChoices,
  batchLabel,
  checkBanner,
  checkTrailer,
  classToForm,
  classToPayload,
  digitsForPrice,
  isDirty,
  paymentPer,
  priceText,
  subjectChoices,
  toMoney,
  validateClass,
} from '@/classes/classUtils';
import { shareTotal } from '@/classes/sessionUtils';
import ConfirmDialog from './ConfirmDialog';
import Dialog from './Dialog';
import { ChoiceGroup, Field, SelectBox } from './FormParts';
import MediaField from './MediaField';
import ShareFields from './ShareFields';
import styles from './classes.module.css';
import s from './sessions.module.css';

const emptyMedia = { url: '', name: '', file: null, removed: false };

function Money({ id, value, invalid, placeholder, onChange, describedBy }) {
  return (
    <div className={`${s.money} ${invalid ? s.inputError : ''}`}>
      <span aria-hidden="true">LKR</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        aria-describedby={describedBy}
        onChange={(event) => onChange(digitsForPrice(event.target.value))}
      />
    </div>
  );
}

// Edit a class: details, payments, schedule, revenue share, visibility, banner and trailer.
// onSave(payload) must return a promise; if it rejects the dialog stays open and shows an error.
// Closing (Discard changes, ✕ or Escape) asks first when something has been changed.
export default function ClassEditDialog({ cls, now, onSave, onClose }) {
  const initial = useMemo(() => classToForm(cls), [cls]);
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

  const { errors, count, total } = validateClass(form);
  const show = (key) => attempted && errors[key];
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const dirty = isDirty(form, initial);

  // The name follows the batch and subject until it has been typed over.
  const setNamed = (patch) =>
    setForm((current) => {
      const next = { ...current, ...patch };
      return current.name === autoName(current) ? { ...next, name: autoName(next) } : next;
    });

  // Removing a file that was never stored just clears the choice.
  const setMedia = (key) => (value) => set({ [key]: value.removed && !initial[key].url ? emptyMedia : value });

  function requestClose() {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  }

  async function submit() {
    if (saving) return;
    setAttempted(true);
    setSaveError('');
    const check = validateClass(form);
    if (check.count > 0) {
      const first = CLASS_FIELD_ORDER.find(([key]) => check.errors[key]);
      if (first) document.getElementById(first[1])?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSave(classToPayload(form));
    } catch {
      if (mounted.current) {
        setSaving(false);
        setSaveError('Couldn’t save the class. Check the connection and try again.');
      }
    }
  }

  const price = toMoney(form.price);
  const special = toMoney(form.specialPrice);
  const specialOk = !!form.specialPrice && special > 0 && special < price;
  const per = paymentPer(form.paymentFormat);
  const priceLabel = per ? `Price ${per}` : 'Price';
  const percentOff = specialOk ? Math.round(((price - special) / price) * 100) : 0;

  const footer = (
    <>
      <button type="button" className={styles.secondaryButton} onClick={requestClose} disabled={saving}>
        Discard changes
      </button>
      <button type="button" className={styles.primaryButton} onClick={submit} disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </>
  );

  return (
    <>
      <Dialog
        title="Edit class"
        titleId="class-edit-title"
        icon="edit_note"
        size="xl"
        closeOnOverlay={false}
        onClose={requestClose}
        footer={footer}
      >
        <div className={s.panel}>
          {attempted && (count > 0 || saveError) && (
            <div className={styles.errorBox} role="alert">
              <Icon name="error" size={20} weight={600} fill={1} />
              <span className={styles.errorText}>
                {saveError ||
                  `Fix ${count} ${count === 1 ? 'thing' : 'things'} to save this class.${errors.shares ? ` The shares add up to ${total}%.` : ''}`}
              </span>
            </div>
          )}

          <section className={s.section} aria-labelledby="class-details-title">
            <h3 id="class-details-title" className={s.blockTitle}>
              Class details
            </h3>
            <Field id="class-name" label="Class name" required error={show('name') && CLASS_ERRORS.name}>
              <input
                id="class-name"
                className={`${s.input} ${show('name') ? s.inputError : ''}`}
                type="text"
                value={form.name}
                maxLength={CLASS_NAME_MAX}
                autoComplete="off"
                data-autofocus
                onChange={(event) => set({ name: event.target.value })}
              />
            </Field>
            <div className={s.row2}>
              <Field id="class-subject" label="Subject" required error={show('subject') && CLASS_ERRORS.subject}>
                <SelectBox id="class-subject" value={form.subject} invalid={show('subject')} onChange={(event) => setNamed({ subject: event.target.value })}>
                  <option value="">Select a subject</option>
                  {subjectChoices(cls.subject).map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </SelectBox>
              </Field>
              <Field id="class-batch" label="Batch" required error={show('batch') && CLASS_ERRORS.batch}>
                <SelectBox id="class-batch" value={form.batch} invalid={show('batch')} onChange={(event) => setNamed({ batch: event.target.value })}>
                  <option value="">Select a batch</option>
                  {batchChoices(initial.batch, now).map((value) => (
                    <option key={value} value={value}>
                      {batchLabel(value)}
                    </option>
                  ))}
                </SelectBox>
              </Field>
            </div>
            <Field
              id="class-info"
              label="Class info"
              hint="Optional. A short description of the class that students will read."
              error={show('description') && `Keep it within ${CLASS_INFO_MAX} characters.`}
            >
              <textarea
                id="class-info"
                className={s.textarea}
                rows={4}
                value={form.description}
                maxLength={CLASS_INFO_MAX}
                onChange={(event) => set({ description: event.target.value })}
              />
              <span className={s.counter} aria-hidden="true">
                {form.description.length}/{CLASS_INFO_MAX}
              </span>
            </Field>
          </section>

          <section className={s.block} aria-labelledby="class-payments-title">
            <h3 id="class-payments-title" className={s.blockTitle}>
              Payments
            </h3>
            <ChoiceGroup
              legend="Payment format"
              name="class-payment-format"
              options={PAYMENT_FORMATS}
              value={form.paymentFormat}
              onChange={(paymentFormat) => set({ paymentFormat })}
            />
            <div className={s.row2}>
              <Field id="class-admission-fee" label="Admission fee" hint="Optional. Charged once when a student joins.">
                <Money id="class-admission-fee" value={form.admissionFee} placeholder="0" onChange={(admissionFee) => set({ admissionFee })} />
              </Field>
              <Field id="class-price" label={priceLabel} required error={show('price') && CLASS_ERRORS.price}>
                <Money id="class-price" value={form.price} invalid={show('price')} placeholder="0" onChange={(value) => set({ price: value })} />
              </Field>
            </div>
            <Field
              id="class-special-price"
              label="Special price"
              error={show('specialPrice') && CLASS_ERRORS.specialPrice}
              hint="Optional. Fill this in if the teacher gives a discount."
            >
              <Money
                id="class-special-price"
                value={form.specialPrice}
                invalid={show('specialPrice')}
                placeholder="No discount"
                onChange={(specialPrice) => set({ specialPrice })}
              />
            </Field>
            {specialOk && (
              <p className={s.notePrice} role="status" data-testid="special-price-note">
                <Icon name="sell" size={17} weight={600} fill={1} />
                Students will pay {priceText(special, form.paymentFormat)} instead of {priceText(price, form.paymentFormat)} ({percentOff}% off).
              </p>
            )}
          </section>

          <section className={s.block} aria-labelledby="class-schedule-title">
            <h3 id="class-schedule-title" className={s.blockTitle}>
              Schedule
            </h3>
            <div className={s.row2}>
              <Field id="class-start-date" label="Start date" required error={show('startDate') && CLASS_ERRORS.startDate}>
                <input
                  id="class-start-date"
                  className={`${s.input} ${show('startDate') ? s.inputError : ''}`}
                  type="date"
                  value={form.startDate}
                  onChange={(event) => set({ startDate: event.target.value })}
                />
              </Field>
              <Field id="class-end-date" label="End date" error={show('endDate') && CLASS_ERRORS.endDate} hint="Optional. Leave empty if the class has no end date.">
                <div className={s.inline}>
                  <input
                    id="class-end-date"
                    className={`${s.input} ${show('endDate') ? s.inputError : ''}`}
                    type="date"
                    min={form.startDate || undefined}
                    value={form.endDate}
                    onChange={(event) => set({ endDate: event.target.value })}
                  />
                  {form.endDate && (
                    <button type="button" className={s.clearLink} onClick={() => set({ endDate: '' })}>
                      Clear
                    </button>
                  )}
                </div>
              </Field>
            </div>
            <div className={s.row3}>
              <Field id="class-day" label="Weekly class day" required error={show('day') && CLASS_ERRORS.day}>
                <SelectBox id="class-day" value={form.day} invalid={show('day')} onChange={(event) => set({ day: event.target.value })}>
                  <option value="">Select a day</option>
                  {WEEKDAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </SelectBox>
              </Field>
              <Field id="class-start-time" label="Start time" required error={show('startTime') && CLASS_ERRORS.startTime}>
                <input
                  id="class-start-time"
                  className={`${s.input} ${show('startTime') ? s.inputError : ''}`}
                  type="time"
                  value={form.startTime}
                  onChange={(event) => set({ startTime: event.target.value })}
                />
              </Field>
              <Field id="class-end-time" label="End time" required error={show('endTime') && CLASS_ERRORS.endTime}>
                <input
                  id="class-end-time"
                  className={`${s.input} ${show('endTime') ? s.inputError : ''}`}
                  type="time"
                  value={form.endTime}
                  onChange={(event) => set({ endTime: event.target.value })}
                />
              </Field>
            </div>
          </section>

          <section className={s.block} aria-labelledby="class-shares-title">
            <h3 id="class-shares-title" className={s.blockTitle}>
              Revenue share
            </h3>
            <p className={s.hint}>How this class’s income is split. The three shares must add up to 100%.</p>
            <ShareFields
              shares={form.shares}
              total={shareTotal(form.shares)}
              showError={attempted}
              onChange={(key, value) => set({ shares: { ...form.shares, [key]: value } })}
            />
          </section>

          <section className={s.block} aria-labelledby="class-visibility-title">
            <h3 id="class-visibility-title" className={s.blockTitle}>
              Visibility
            </h3>
            <ChoiceGroup
              legend="Class visibility"
              name="class-visibility"
              options={VISIBILITY}
              value={form.visibility}
              onChange={(visibility) => set({ visibility })}
            />
          </section>

          <section className={s.block} aria-labelledby="class-media-title">
            <h3 id="class-media-title" className={s.blockTitle}>
              Banner and trailer
            </h3>
            <MediaField
              id="class-banner"
              kind="image"
              label="Class banner"
              hint={`Optional. The picture students see for this class. ${BANNER_TYPES.map((t) => t.toUpperCase()).join(', ')} up to 5 MB.`}
              accept={BANNER_TYPES.map((t) => `.${t}`).join(',')}
              value={form.banner}
              check={checkBanner}
              onChange={setMedia('banner')}
            />
            <MediaField
              id="class-trailer"
              kind="video"
              label="Class trailer"
              hint={`Optional. A short video introducing the class. ${TRAILER_TYPES.map((t) => t.toUpperCase()).join(', ')} up to 200 MB.`}
              accept={TRAILER_TYPES.map((t) => `.${t}`).join(',')}
              value={form.trailer}
              check={checkTrailer}
              onChange={setMedia('trailer')}
            />
          </section>
        </div>
      </Dialog>

      {confirmDiscard && (
        <ConfirmDialog
          title="Discard your changes?"
          message="The changes you made to this class haven’t been saved. If you discard them, the class stays as it was."
          confirmLabel="Discard changes"
          cancelLabel="Keep editing"
          onConfirm={onClose}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </>
  );
}
