'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { SUBJECTS } from '@/study-packs/constants';
import { toNumber, validatePack } from '@/study-packs/utils';
import ActionBar from './ActionBar';
import ClassSection from './ClassSection';
import CoverSection from './CoverSection';
import PackDetailsSection from './PackDetailsSection';
import PriceValiditySection from './PriceValiditySection';
import RevenueShareSection from './RevenueShareSection';
import StepMarker from './StepMarker';
import StorePreviewCard from './StorePreviewCard';
import styles from './study-packs.module.css';

function revokeBlob(url) {
  if (typeof url === 'string' && url.startsWith('blob:')) URL.revokeObjectURL(url);
}

// Step 1 of building a pack: general settings. Nothing is saved here.
// `pack` is the saved pack being edited (null when creating).
// `draft` = { form, coverFile } is the pending work held by the parent, so it survives a trip to step 2.
// `onNext({ form, coverFile })` moves on to the recordings step; `onCancel(coverUrl)` throws the draft away.
export default function StudyPackForm({ pack, draft, teachers, onCancel, onNext }) {
  const isPublished = pack?.status === 'published';

  const [form, setForm] = useState(draft.form);
  const [coverFile, setCoverFile] = useState(draft.coverFile);
  // null until the first Next attempt; errors only show after that
  const [attempted, setAttempted] = useState(false);
  const [bannerTick, setBannerTick] = useState(0);

  const bannerRef = useRef(null);

  const validation = useMemo(() => validatePack(form), [form]);

  // A pack that isn't live only needs a name to move on (the rest is checked when publishing).
  // A live pack must stay complete, so every field is checked.
  const shownErrors = !attempted ? {} : isPublished ? validation.errors : { name: validation.errors.name };
  const errorCount = Object.values(shownErrors).filter(Boolean).length;

  useEffect(() => {
    if (bannerTick > 0) bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [bannerTick]);

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

  // A picked cover is previewed through a local object URL; free the old one when it is replaced.
  function handleCoverSelect(file) {
    revokeBlob(form.coverUrl);
    setCoverFile(file);
    update('coverUrl', URL.createObjectURL(file));
  }

  function handleCoverRemove() {
    revokeBlob(form.coverUrl);
    setCoverFile(null);
    update('coverUrl', null);
  }

  function handleNext() {
    setAttempted(true);
    const blocked = isPublished ? validation.count > 0 : validation.errors.name;
    if (blocked) {
      setBannerTick((tick) => tick + 1);
      return;
    }
    onNext({ form, coverFile });
  }

  return (
    <div className={styles.page}>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderLeft}>
          <button type="button" className={styles.backLink} onClick={() => onCancel(form.coverUrl)}>
            <Icon name="arrow_back" size={18} weight={600} />
            All study packs
          </button>
          <h1 className={styles.h1}>{pack ? 'Edit study pack' : 'New study pack'}</h1>
        </div>

        <StepMarker step={1} />
      </div>

      {errorCount > 0 ? (
        <div ref={bannerRef} className={styles.banner} role="alert">
          <Icon name="error" size={22} fill={1} />
          <div className={styles.bannerText}>
            <strong>
              Please fix {errorCount} {errorCount === 1 ? 'problem' : 'problems'} before continuing.
            </strong>
            {shownErrors.shares ? (
              <span>Revenue shares add up to {validation.total}%, but they must total exactly 100%.</span>
            ) : null}
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
            <p>The next step is adding sessions from Class Recordings to this pack. You save on that step.</p>
          </div>
        </aside>
      </div>

      <ActionBar step={1} onCancel={() => onCancel(form.coverUrl)} onNext={handleNext} />
    </div>
  );
}
