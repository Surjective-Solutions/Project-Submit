'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { SUBJECTS } from '@/study-packs/constants';
import { formToValues, packToForm, toNumber, validatePack } from '@/study-packs/utils';
import ActionBar from './ActionBar';
import ClassSection from './ClassSection';
import CoverSection from './CoverSection';
import PackDetailsSection from './PackDetailsSection';
import PriceValiditySection from './PriceValiditySection';
import RevenueShareSection from './RevenueShareSection';
import StorePreviewCard from './StorePreviewCard';
import styles from './study-packs.module.css';

// Step 1 of building a pack: general settings. `pack` is null when creating.
// `onSave({ intent, values, coverFile, removeCover })` may throw; the message is shown in the banner.
export default function StudyPackForm({ pack, teachers, onCancel, onSave }) {
  const editing = Boolean(pack);
  const isPublished = pack?.status === 'published';

  const [form, setForm] = useState(() => packToForm(pack));
  const [coverFile, setCoverFile] = useState(null);
  // null until the first Save / Save & publish attempt; errors only show after that
  const [attempt, setAttempt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [bannerTick, setBannerTick] = useState(0);

  const objectUrlRef = useRef(null);
  const bannerRef = useRef(null);

  const validation = useMemo(() => validatePack(form), [form]);

  // A draft only needs a name. Publishing, and saving a pack that is already live, needs everything.
  const fullCheck = attempt === 'publish' || isPublished;
  const shownErrors = attempt === null ? {} : fullCheck ? validation.errors : { name: validation.errors.name };
  const errorCount = Object.values(shownErrors).filter(Boolean).length;
  const showBanner = errorCount > 0 || Boolean(saveError);

  useEffect(() => {
    if (bannerTick > 0) bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [bannerTick]);

  // free the local preview of a picked cover when the form closes
  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateShare(key, value) {
    setForm((prev) => ({ ...prev, shares: { ...prev.shares, [key]: value } }));
  }

  // Picking a teacher fills Subject, but only while Subject is still empty.
  function handleTeacherChange(teacherId) {
    setForm((prev) => {
      const next = { ...prev, teacherId };
      const teacher = teachers.find((t) => String(t.id) === String(teacherId));
      if (!prev.subject && teacher?.subject && SUBJECTS.includes(teacher.subject)) {
        next.subject = teacher.subject;
      }
      return next;
    });
  }

  function releaseObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function handleCoverSelect(file) {
    releaseObjectUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setCoverFile(file);
    update('coverUrl', url);
  }

  function handleCoverRemove() {
    releaseObjectUrl();
    setCoverFile(null);
    update('coverUrl', null);
  }

  async function handleAction(intent) {
    if (saving) return;
    setAttempt(intent);
    setSaveError('');

    const needsEverything = intent === 'publish' || isPublished;
    const blocked = needsEverything ? validation.count > 0 : validation.errors.name;
    if (blocked) {
      setBannerTick((tick) => tick + 1);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        intent,
        values: formToValues(form),
        coverFile,
        // an existing cover was taken away and nothing replaced it
        removeCover: Boolean(pack?.coverUrl) && !form.coverUrl,
      });
    } catch (err) {
      setSaveError(err?.message || 'Could not save the study pack. Please try again.');
      setSaving(false);
      setBannerTick((tick) => tick + 1);
    }
  }

  const actionMode = !editing ? 'create' : isPublished ? 'published' : 'draft';

  return (
    <div className={styles.page}>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderLeft}>
          <button type="button" className={styles.backLink} onClick={onCancel}>
            <Icon name="arrow_back" size={18} weight={600} />
            All study packs
          </button>
          <h1 className={styles.h1}>{editing ? 'Edit study pack' : 'New study pack'}</h1>
        </div>

        <ol className={styles.stepMarker} aria-label="Steps">
          <li className={`${styles.stepPill} ${styles.stepPillCurrent}`} aria-current="step">
            <span className={styles.stepNumber}>1</span>
            General settings
          </li>
          <li className={styles.stepLine} aria-hidden="true" />
          <li className={styles.stepPill}>
            <span className={styles.stepNumber}>2</span>
            Recordings &amp; materials
          </li>
        </ol>
      </div>

      {showBanner ? (
        <div ref={bannerRef} className={styles.banner} role="alert">
          <Icon name="error" size={22} fill={1} />
          <div className={styles.bannerText}>
            {errorCount > 0 ? (
              <strong>
                Please fix {errorCount} {errorCount === 1 ? 'problem' : 'problems'} before saving.
              </strong>
            ) : null}
            {shownErrors.shares ? (
              <span>Revenue shares add up to {validation.total}%, but they must total exactly 100%.</span>
            ) : null}
            {saveError ? <span>{saveError}</span> : null}
          </div>
        </div>
      ) : null}

      <div className={styles.formLayout}>
        <div className={styles.formMain}>
          <PackDetailsSection form={form} errors={shownErrors} onChange={update} />
          <ClassSection
            form={form}
            errors={shownErrors}
            teachers={teachers}
            onChange={update}
            onTeacherChange={handleTeacherChange}
          />
          <PriceValiditySection form={form} errors={shownErrors} onChange={update} />
          <RevenueShareSection
            form={form}
            price={toNumber(form.price)}
            total={validation.total}
            onShareChange={updateShare}
          />
          <CoverSection coverUrl={form.coverUrl} onSelect={handleCoverSelect} onRemove={handleCoverRemove} />
        </div>

        <aside className={styles.formAside}>
          <StorePreviewCard form={form} teachers={teachers} />
          <div className={styles.infoBox}>
            <Icon name="info" size={19} fill={1} />
            <p>After saving, the next step is adding sessions from Class Recordings to this pack.</p>
          </div>
        </aside>
      </div>

      <ActionBar
        mode={actionMode}
        saving={saving}
        onCancel={onCancel}
        onSave={() => handleAction('save')}
        onPublish={() => handleAction('publish')}
      />
    </div>
  );
}
