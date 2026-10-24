'use client';

import Icon from '@/components/admin/Icon';
import styles from './study-packs.module.css';

// Sticky bar at the bottom of both steps.
// step 1: Cancel and Next. step 2: Cancel, Save and (for a pack that isn't live yet) Save & publish.
export default function ActionBar({ step, live, saving, onCancel, onNext, onSave, onPublish }) {
  if (step === 1) {
    return (
      <div className={styles.actionBar}>
        <p className={styles.actionText}>
          Nothing is saved yet. Next, add the recordings; you save on that last step.
        </p>
        <div className={styles.actionButtons}>
          <button type="button" className={styles.neutralButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            style={{ padding: '0 12px 0 18px' }}
            onClick={onNext}
          >
            Next
            <Icon name="arrow_forward" size={18} weight={600} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.actionBar}>
      <p className={styles.actionText}>
        {live
          ? 'This pack is live. Saved changes show to students straight away.'
          : 'Save keeps the pack as a draft. Save & publish makes it available to students.'}
      </p>
      <div className={styles.actionButtons}>
        <button type="button" className={styles.neutralButton} onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button
          type="button"
          className={live ? styles.primaryButton : styles.secondaryButton}
          onClick={onSave}
          disabled={saving}
        >
          <Icon name="save" size={18} weight={600} />
          {saving ? 'Saving…' : live ? 'Save changes' : 'Save'}
        </button>
        {live ? null : (
          <button type="button" className={styles.primaryButton} onClick={onPublish} disabled={saving}>
            <Icon name="publish" size={18} weight={600} />
            Save &amp; publish
          </button>
        )}
      </div>
    </div>
  );
}
