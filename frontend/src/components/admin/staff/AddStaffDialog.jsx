'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { CATEGORIES } from '@/mocks/staff';
import styles from './staff.module.css';

const ROLE_FIELD_LABEL = {
  teachers: 'Subject & stream',
  instructors: 'Assists teacher',
  cashiers: 'Desk',
};

const ROLE_FIELD_PLACEHOLDER = {
  teachers: 'e.g. Physics · A/L',
  instructors: 'e.g. Mr. Ruwan Perera',
  cashiers: 'e.g. Online slip desk',
};

export default function AddStaffDialog({ open, defaultCategory, onClose, onSubmit }) {
  const [categoryKey, setCategoryKey] = useState(defaultCategory);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [roleField, setRoleField] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setCategoryKey(defaultCategory);
      setFullName('');
      setMobile('');
      setEmail('');
      setRoleField('');
      setErrors({});
    }
  }, [open, defaultCategory]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {
      fullName: fullName.trim().length === 0,
      mobile: mobile.trim().length === 0,
      email: email.trim().length === 0,
      roleField: roleField.trim().length === 0,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    onSubmit(categoryKey, {
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      roleField: roleField.trim(),
    });
  }

  return (
    <div className={styles.dialogOverlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Add staff member</h2>
          <button type="button" className={styles.iconCloseButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.segmented}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={
                categoryKey === cat.key ? `${styles.segmentBtn} ${styles.segmentActive}` : styles.segmentBtn
              }
              onClick={() => setCategoryKey(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.dialogForm}>
          <label className={styles.fieldLabel}>
            Full name
            <input
              className={errors.fullName ? `${styles.fieldInput} ${styles.fieldInvalid}` : styles.fieldInput}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Mr. Ruwan Perera"
            />
          </label>

          <label className={styles.fieldLabel}>
            Mobile number
            <input
              className={errors.mobile ? `${styles.fieldInput} ${styles.fieldInvalid}` : styles.fieldInput}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+94 71 234 5678"
            />
          </label>

          <label className={styles.fieldLabel}>
            Email
            <input
              type="email"
              className={errors.email ? `${styles.fieldInput} ${styles.fieldInvalid}` : styles.fieldInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@syzygy.lk"
            />
          </label>

          <label className={styles.fieldLabel}>
            {ROLE_FIELD_LABEL[categoryKey]}
            <input
              className={errors.roleField ? `${styles.fieldInput} ${styles.fieldInvalid}` : styles.fieldInput}
              value={roleField}
              onChange={(e) => setRoleField(e.target.value)}
              placeholder={ROLE_FIELD_PLACEHOLDER[categoryKey]}
            />
          </label>

          <p className={styles.dialogNote}>
            They&rsquo;ll get an SMS and email invite to set a password. Access starts once they accept.
          </p>

          <div className={styles.dialogActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.sendInviteButton}>
              <Icon name="send" size={18} weight={600} />
              Send invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}