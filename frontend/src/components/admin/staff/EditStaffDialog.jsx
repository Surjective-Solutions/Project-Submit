'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/admin/Icon';
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_NUMBER_PATTERN = /^\d{10}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

function validateFieldValue(key, value) {
  if (key === 'email' && !EMAIL_PATTERN.test(value)) {
    return 'Please enter a valid email address.';
  }
  if (key === 'mobile' && !CONTACT_NUMBER_PATTERN.test(value)) {
    return 'Contact number must be exactly 10 digits.';
  }
  if (key === 'username' && !USERNAME_PATTERN.test(value)) {
    return 'Username can only contain letters, numbers, and underscores.';
  }
  return null;
}

const EDIT_FIELDS = {
  teachers: [
    { key: 'fullName', label: 'Full name', placeholder: 'e.g. Mr. Ruwan Perera' },
    { key: 'mobile', label: 'Contact number', placeholder: '+94 71 234 5678' },
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
    { key: 'mobile', label: 'Contact number', placeholder: '+94 71 234 5678' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'name@syzygy.lk' },
    { key: 'nic', label: 'NIC', placeholder: 'e.g. 200012345678V', readOnly: true,},
    { key: 'address', label: 'Address', placeholder: 'e.g. 12, Galle Road, Colombo' },
  ],
  cashiers: [
    { key: 'fullName', label: 'Full name', placeholder: 'e.g. Ms. Nadeesha Silva' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'name@syzygy.lk' },
    { key: 'mobile', label: 'Contact number', placeholder: '+94 71 234 5678' },
    { key: 'username', label: 'Username'},
    { key: 'nic', label: 'NIC', readOnly: true },
  ],
};

export default function EditStaffDialog({ open, category, person, onClose, onSubmit }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && person && category) {
      const initial = {};
      EDIT_FIELDS[category.key].forEach((f) => {
        initial[f.key] = person[f.key] ?? '';
      });
      setFormData(initial);
      setErrors({});
    }
  }, [open, person, category]);

  if (!open || !person || !category) return null;

  function handleChange(key, value) {
    let nextValue = value;
    if (key === 'mobile') {
      nextValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData((prev) => {
      const next = { ...prev, [key]: nextValue };
      EDIT_FIELDS[category.key].forEach((f) => {
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
    EDIT_FIELDS[category.key].forEach((f) => {
      if (f.readOnly) return;

      const value = formData[f.key];
      if (!value || value.trim().length === 0) {
        nextErrors[f.key] = 'This field is required.';
        return;
      }

      const message = validateFieldValue(f.key, value.trim());
      if (message) {
        nextErrors[f.key] = message;
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {};
    EDIT_FIELDS[category.key].forEach((f) => {
      payload[f.key] = (formData[f.key] ?? '').trim();
    });

    onSubmit(person.id, payload);
  }

  return (
    <div className={styles.dialogOverlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Edit {category.singularLabel.toLowerCase()}</h2>
          <button type="button" className={styles.iconCloseButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.dialogForm}>
          {EDIT_FIELDS[category.key].map((f) => {
            const isSelect = f.type === 'select';
            const options = f.optionsFor ? f.optionsFor(formData) : f.options;
            const isDependentDisabled = f.dependsOn && !formData[f.dependsOn];

            return (
              <label className={styles.fieldLabel} key={f.key}>
                {f.label}
                {isSelect ? (
                  <select
                    className={errors[f.key] ? `${styles.fieldInput} ${styles.fieldInvalid}` : styles.fieldInput}
                    value={formData[f.key] ?? ''}
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
                    className={[
                      styles.fieldInput,
                      errors[f.key] ? styles.fieldInvalid : '',
                      f.readOnly ? styles.fieldReadOnly : '',
                    ].filter(Boolean).join(' ')}
                    value={formData[f.key] ?? ''}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    disabled={f.readOnly}
                    readOnly={f.readOnly}
                  />
                )}
                {errors[f.key] && <span className={styles.fieldError}>{errors[f.key]}</span>}
              </label>
            );
          })}

          <p className={styles.dialogNote}>Changes are saved immediately — no password required.</p>

          <div className={styles.dialogActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.sendInviteButton}>
              <Icon name="save" size={18} weight={600} />
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}