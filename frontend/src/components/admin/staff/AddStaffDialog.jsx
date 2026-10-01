'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { CATEGORIES } from '@/mocks/staff';
import styles from './staff.module.css';

const SUBJECTS_BY_LEVEL = {
  'G.C.E. Advanced Level': [
    'Combined Mathematics',
    'Physics',
    'Chemistry',
    'Science for Technology',
    'Business Studies',
    'Accounting',
    'Economics',
  ],
  'G.C.E. Ordinary Level': [
    'Science',
    'Mathematics',
    'Sinhala',
    'English',
    'History',
    'Business and Accounting Studies',
    'Information and Communication Technology',
  ],
};

const FIELDS = {
  teachers: [
    { key: 'fullName', label: 'Full name', placeholder: 'e.g. Mr. Ruwan Perera' },
    { key: 'username', label: 'Username', placeholder: 'e.g. ruwan.perera' },
    { key: 'contactNumber', label: 'Contact number', placeholder: '+94 71 234 5678' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'name@syzygy.lk' },
    {
      key: 'examLevel',
      label: 'Exam level',
      type: 'select',
      options: ['G.C.E. Ordinary Level', 'G.C.E. Advanced Level'],
    },
    {
      key: 'medium',
      label: 'Medium',
      type: 'select',
      options: ['Sinhala', 'English', 'Sinhala & English'],
    },
    {
      key: 'subject',
      label: 'Subject',
      type: 'select',
      optionsFor: (formData) => SUBJECTS_BY_LEVEL[formData.examLevel] || [],
      dependsOn: 'examLevel',
    },
  ],
  instructors: [
    { key: 'fullName', label: 'Full name', placeholder: 'e.g. Mr. Ruwan Perera' },
    { key: 'contactNumber', label: 'Contact number', placeholder: '+94 71 234 5678' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'name@syzygy.lk' },
    { key: 'nic', label: 'NIC', placeholder: 'e.g. 200012345678V' },
    { key: 'address', label: 'Address', placeholder: 'e.g. 12, Galle Road, Colombo' },
  ],
  cashiers: [
    { key: 'fullName', label: 'Full name', placeholder: 'e.g. Ms. Nadeesha Silva' },
    { key: 'username', label: 'Username', placeholder: 'e.g. nadeesha.silva' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'name@syzygy.lk' },
    { key: 'contactNumber', label: 'Contact number', placeholder: '+94 71 234 5678' },
  ],
};

function emptyFormData(categoryKey) {
  const base = {};
  FIELDS[categoryKey].forEach((f) => { base[f.key] = ''; });
  base.password = '';
  base.confirmPassword = '';
  return base;
}

export default function AddStaffDialog({ open, defaultCategory, onClose, onSubmit }) {
  const [categoryKey, setCategoryKey] = useState(defaultCategory);
  const [formData, setFormData] = useState(() => emptyFormData(defaultCategory));
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setCategoryKey(defaultCategory);
      setFormData(emptyFormData(defaultCategory));
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open, defaultCategory]);

  if (!open) return null;

  function handleCategoryChange(key) {
    setCategoryKey(key);
    setFormData(emptyFormData(key));
    setErrors({});
  }

  function handleChange(key, value) {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      FIELDS[categoryKey].forEach((f) => {
        if (f.dependsOn === key) {
          const validOptions = f.optionsFor(next);
          if (!validOptions.includes(next[f.key])) {
            next[f.key] = '';
          }
        }
      });
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const nextErrors = {};
    FIELDS[categoryKey].forEach((f) => {
      if (formData[f.key].trim().length === 0) nextErrors[f.key] = true;
    });
    if (formData.password.trim().length === 0) nextErrors.password = true;
    if (formData.confirmPassword.trim().length === 0) nextErrors.confirmPassword = true;
    if (
      formData.password.length > 0 &&
      formData.confirmPassword.length > 0 &&
      formData.password !== formData.confirmPassword
    ) {
      nextErrors.confirmPassword = true;
      nextErrors.passwordMismatch = true;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {};
    FIELDS[categoryKey].forEach((f) => { payload[f.key] = formData[f.key].trim(); });
    payload.password = formData.password;
    payload.confirmPassword = formData.confirmPassword;

    onSubmit(categoryKey, payload);
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
              onClick={() => handleCategoryChange(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.dialogForm}>
          {FIELDS[categoryKey].map((f) => {
            const isSelect = f.type === 'select';
            const options = f.optionsFor ? f.optionsFor(formData) : f.options;
            const isDependentDisabled = f.dependsOn && !formData[f.dependsOn];

            return (
              <label className={styles.fieldLabel} key={f.key}>
                {f.label}
                {isSelect ? (
                  <select
                    className={errors[f.key] ? `${styles.fieldInput} ${styles.fieldInvalid}` : styles.fieldInput}
                    value={formData[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    disabled={isDependentDisabled}
                  >
                    <option value="" disabled>
                      {isDependentDisabled ? 'Select exam level first' : 'Select an option'}
                    </option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || 'text'}
                    className={errors[f.key] ? `${styles.fieldInput} ${styles.fieldInvalid}` : styles.fieldInput}
                    value={formData[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder}
                  />
                )}
              </label>
            );
          })}

          <label className={styles.fieldLabel}>
            Password
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={errors.password ? `${styles.fieldInput} ${styles.fieldInvalid}` : styles.fieldInput}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="At least 8 characters"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#8B90A0',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={18} />
              </button>
            </div>
          </label>

          <label className={styles.fieldLabel}>
            Confirm password
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={errors.confirmPassword ? `${styles.fieldInput} ${styles.fieldInvalid}` : styles.fieldInput}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#8B90A0',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <Icon name={showConfirmPassword ? 'visibility_off' : 'visibility'} size={18} />
              </button>
            </div>
          </label>
          {errors.passwordMismatch && (
            <p style={{ fontSize: 12.5, color: '#C81E24', margin: '-10px 0 0' }}>Passwords do not match.</p>
          )}

          <p className={styles.dialogNote}>
            They&rsquo;ll be able to sign in immediately using the password you set here.
          </p>

          <div className={styles.dialogActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.sendInviteButton}>
              <Icon name="person_add" size={18} weight={600} />
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}