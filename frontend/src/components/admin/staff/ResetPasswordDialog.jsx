'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/admin/Icon';
import styles from './staff.module.css';

// Same rule enforced at account creation: at least 8 chars, upper, lower, digit, special char.
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ResetPasswordDialog({ open, person, onClose, onSubmit }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
      setSubmitting(false);
    }
  }, [open, person]);

  if (!open || !person) return null;

  function validate() {
    const nextErrors = {};
    if (newPassword.trim().length === 0) {
      nextErrors.newPassword = 'This field is required.';
    } else if (!STRONG_PASSWORD_PATTERN.test(newPassword)) {
      nextErrors.newPassword =
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.';
    }

    if (confirmNewPassword.trim().length === 0) {
      nextErrors.confirmNewPassword = 'This field is required.';
    } else if (newPassword !== confirmNewPassword) {
      nextErrors.confirmNewPassword = 'Passwords do not match.';
    }

    return nextErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await onSubmit(person.id, { newPassword, confirmNewPassword });
      if (result?.isSuccess === false) {
        setErrors({ form: result.message || 'Could not reset password.' });
        setSubmitting(false);
        return;
      }
      onClose();
    } catch (err) {
      setErrors({ form: err?.message || 'Could not reset password.' });
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.dialogOverlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Reset password</h2>
          <button type="button" className={styles.iconCloseButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <p className={styles.dialogNote} style={{ marginTop: 0 }}>
          Set a new password for <strong>{person.fullName}</strong>. They&rsquo;ll need to use it the next time they sign in.
        </p>

        <form onSubmit={handleSubmit} className={styles.dialogForm}>
          <label className={styles.fieldLabel}>
            New password
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={errors.newPassword ? `${styles.fieldInput} ${styles.fieldInvalid}` : styles.fieldInput}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                style={{ paddingRight: 40 }}
                autoFocus
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
            {errors.newPassword && (
              <span style={{ fontSize: 12.5, color: '#C81E24' }}>{errors.newPassword}</span>
            )}
          </label>

          <label className={styles.fieldLabel}>
            Confirm new password
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={errors.confirmNewPassword ? `${styles.fieldInput} ${styles.fieldInvalid}` : styles.fieldInput}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
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
            {errors.confirmNewPassword && (
              <span style={{ fontSize: 12.5, color: '#C81E24' }}>{errors.confirmNewPassword}</span>
            )}
          </label>

          {errors.form && (
            <p style={{ fontSize: 12.5, color: '#C81E24', margin: '-6px 0 0' }}>{errors.form}</p>
          )}

          <div className={styles.dialogActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className={styles.sendInviteButton} disabled={submitting}>
              <Icon name="lock_reset" size={18} weight={600} />
              {submitting ? 'Resetting…' : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}