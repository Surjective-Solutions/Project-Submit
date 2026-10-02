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
    'Biology',
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
    { key: 'contactNumber', label: 'Contact number', placeholder: 'e.g. 0712345678' },
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
    { key: 'email', label: 'Email', type: 'email', placeholder: 'name@syzygy.lk' },
    { key: 'contactNumber', label: 'Contact number', placeholder: 'e.g. 0712345678' },
    { key: 'nic', label: 'NIC', placeholder: 'e.g. 200012345678V' },
    { key: 'address', label: 'Address', placeholder: 'e.g. 12, Galle Road, Colombo' },
  ],
  cashiers: [
    { key: 'fullName', label: 'Full name', placeholder: 'e.g. Ms. Nadeesha Silva' },
    { key: 'username', label: 'Username', placeholder: 'e.g. nadeesha.silva' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'name@syzygy.lk' },
    { key: 'contactNumber', label: 'Contact number', placeholder: 'e.g. 0712345678' },
  ],
};

// --- Validation rules -------------------------------------------------

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character.
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// Per-field validation beyond "is it empty". Returns an error message string,
// or '' when the value is fine.
function validateFieldValue(key, value) {
  switch (key) {
    case 'username':
      return USERNAME_PATTERN.test(value)
        ? ''
        : 'Username can only contain letters, numbers, and underscores.';
    case 'contactNumber':
      return /^\d{10}$/.test(value)
        ? ''
        : 'Contact number must be exactly 10 digits.';
    case 'email':
      return EMAIL_PATTERN.test(value)
        ? ''
        : 'Please enter a valid email address.';
    default:
      return '';
  }
}

function validatePassword(value) {
  return STRONG_PASSWORD_PATTERN.test(value)
    ? ''
    : 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.';
}

// ------------------------------------------------------------------------

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
    // Contact number: strip anything non-numeric as the person types, and
    // hard-cap at 10 digits so a longer number can never be entered.
    const nextValue = key === 'contactNumber' ? value.replace(/\D/g, '').slice(0, 10) : value;

    setFormData((prev) => {
      const next = { ...prev, [key]: nextValue };
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
      const value = formData[f.key].trim();
      if (value.length === 0) {
        nextErrors[f.key] = 'This field is required.';
        return;
      }
      const message = validateFieldValue(f.key, value);
      if (message) nextErrors[f.key] = message;
    });

    if (formData.password.trim().length === 0) {
      nextErrors.password = 'This field is required.';
    } else {
      const passwordMessage = validatePassword(formData.password);
      if (passwordMessage) nextErrors.password = passwordMessage;
    }

    if (formData.confirmPassword.trim().length === 0) {
      nextErrors.confirmPassword = 'This field is required.';
    }

    if (
      formData.password.length > 0 &&
      formData.confirmPassword.length > 0 &&
      formData.password !== formData.confirmPassword
    ) {
      nextErrors.confirmPassword = 'Passwords do not match.';
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
                    {...(f.key === 'contactNumber' ? { inputMode: 'numeric', maxLength: 10 } : {})}
                  />
                )}
                {errors[f.key] && (
                  <span style={{ fontSize: 12.5, color: '#C81E24' }}>{errors[f.key]}</span>
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
            {errors.password && (
              <span style={{ fontSize: 12.5, color: '#C81E24' }}>{errors.password}</span>
            )}
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
            {errors.confirmPassword && (
              <span style={{ fontSize: 12.5, color: '#C81E24' }}>{errors.confirmPassword}</span>
            )}
          </label>

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