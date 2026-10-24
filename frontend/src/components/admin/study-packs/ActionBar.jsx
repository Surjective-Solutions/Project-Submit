'use client';

import Icon from '@/components/admin/Icon';
import styles from './study-packs.module.css';

// mode: 'create' | 'draft' (editing a draft) | 'published' (editing a live pack)
export default function ActionBar({ mode, saving, onCancel, onSave, onPublish }) {
  const live = mode === 'published';

  return (
    <div className={styles.actionBar}>
      <p className={styles.actionText}>
        {live
          ? 'This pack is live, so saving needs every required field.'
          : 'Save keeps it as a draft (only the name is required). Save & publish needs every required field.'}
      </p>
      <div className={styles.actionButtons}>
        <button type="button" className={styles.neutralButton} onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        {live ? (
          <button type="button" className={styles.primaryButton} onClick={onSave} disabled={saving}>
            <Icon name="save" size={19} weight={600} />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        ) : (
          <>
            <button type="button" className={styles.secondaryButton} onClick={onSave} disabled={saving}>
              <Icon name="save" size={19} weight={600} />
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className={styles.primaryButton} onClick={onPublish} disabled={saving}>
              <Icon name="publish" size={19} weight={600} />
              Save &amp; publish
            </button>
          </>
        )}
      </div>
    </div>
  );
}
