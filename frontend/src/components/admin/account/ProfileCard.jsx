'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/admin/Icon';
import { updateAdminAccount } from '@/lib/api-client';
import {
  buildUpdateForm,
  checkPhotoFile,
  errorMessage,
  formatPhoneInput,
  initialsOf,
  normalizePhone,
  photoSrc,
  validateProfile,
} from '@/admin-account/utils';
import styles from './account.module.css';

const FIELD_ORDER = ['fullName', 'email', 'phone'];

export default function ProfileCard({ profile, onSaved }) {
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(formatPhoneInput(profile.phone));
  const [photo, setPhoto] = useState(null); // a newly chosen photo: { dataUrl, file }
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const fileRef = useRef(null);
  const readToken = useRef(0);
  useEffect(
    () => () => {
      readToken.current += 1; // a photo still being read after the page closes is ignored
    },
    []
  );

  const errors = validateProfile({ fullName, email, phone });
  const shownErrors = submitted ? errors : {};
  const dirty =
    fullName.trim() !== (profile.fullName || '') ||
    email.trim() !== (profile.email || '') ||
    normalizePhone(phone) !== normalizePhone(profile.phone) ||
    !!photo ||
    removePhoto;

  const savedPhoto = removePhoto ? '' : photoSrc(profile.photoUrl);
  const shownPhoto = photo ? photo.dataUrl : savedPhoto;
  const hasPhoto = !!shownPhoto;

  function choosePhoto(file) {
    if (!file) return;
    const problem = checkPhotoFile(file);
    if (problem) {
      setPhotoError(problem);
      return;
    }
    setPhotoError('');
    const token = (readToken.current += 1);
    const reader = new FileReader();
    reader.onload = () => {
      if (token !== readToken.current) return;
      setPhoto({ dataUrl: reader.result, file });
      setRemovePhoto(false);
    };
    reader.onerror = () => {
      if (token === readToken.current) setPhotoError('Could not read that file. Try another photo.');
    };
    reader.readAsDataURL(file);
  }

  function handleFileInput(event) {
    choosePhoto(event.target.files?.[0]);
    event.target.value = ''; // lets the same file be picked again
  }

  function handleRemovePhoto() {
    readToken.current += 1;
    setPhotoError('');
    if (photo) setPhoto(null); // a staged photo is just dropped; the saved one stays
    else setRemovePhoto(true);
  }

  function discard() {
    readToken.current += 1;
    setFullName(profile.fullName || '');
    setEmail(profile.email || '');
    setPhone(formatPhoneInput(profile.phone));
    setPhoto(null);
    setRemovePhoto(false);
    setPhotoError('');
    setSubmitted(false);
    setServerError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setSubmitted(true);
    setServerError('');

    const firstBad = FIELD_ORDER.find((key) => errors[key]);
    if (firstBad) {
      const el = document.getElementById(`acc-${firstBad}`);
      el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      el?.focus({ preventScroll: true });
      return;
    }
    if (!dirty) return;

    setSaving(true);
    try {
      const res = await updateAdminAccount(
        buildUpdateForm({ fullName, email, phone, photoFile: photo?.file, removePhoto })
      );
      if (!res?.isSuccess) {
        setServerError(res?.message || 'Could not save your changes. Please try again.');
        return;
      }
      onSaved(res);
      setFullName(res.fullName ?? fullName.trim());
      setEmail(res.email ?? email.trim());
      setPhone(formatPhoneInput(res.phone ?? phone));
      setPhoto(null);
      setRemovePhoto(false);
      setSubmitted(false);
      toast.success('Your account was updated.');
    } catch (error) {
      setServerError(errorMessage(error, 'Couldn’t reach the server. Check the connection and try again.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate aria-labelledby="acc-profile-title">
      <header className={styles.cardHeader}>
        <span className={styles.cardIcon} aria-hidden="true">
          <Icon name="person" size={19} />
        </span>
        <div className={styles.cardTitles}>
          <h2 id="acc-profile-title" className={styles.cardTitle}>
            Profile
          </h2>
          <p className={styles.cardSub}>Your name, contact details and picture.</p>
        </div>
      </header>

      <div className={styles.photoRow}>
        {hasPhoto ? (
          <span
            className={styles.photoCircle}
            style={{ backgroundImage: `url(${shownPhoto})` }}
            role="img"
            aria-label="Profile picture"
            data-testid="photo-circle"
          />
        ) : (
          <span className={`${styles.photoCircle} ${styles.photoInitials}`} aria-hidden="true" data-testid="photo-circle">
            {initialsOf(fullName)}
          </span>
        )}
        <div className={styles.photoBody}>
          <p className={styles.photoName}>
            {fullName.trim() || 'Your name'}
            {profile.role && <span className={styles.roleChip}>{profile.role}</span>}
          </p>
          <div className={styles.photoActions}>
            <input
              ref={fileRef}
              id="acc-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.hiddenInput}
              onChange={handleFileInput}
              aria-label="Choose a profile picture"
              tabIndex={-1}
            />
            <button type="button" className={styles.secondaryButton} onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={18} />
              {hasPhoto ? 'Replace photo' : 'Upload photo'}
            </button>
            {hasPhoto && (
              <button type="button" className={styles.removeButton} onClick={handleRemovePhoto}>
                Remove
              </button>
            )}
          </div>
          <p className={styles.hint}>Square photo · JPG, PNG or WebP · under 2 MB.</p>
          {photoError && (
            <p className={styles.error} role="alert">
              {photoError}
            </p>
          )}
        </div>
      </div>

      <hr className={styles.divider} />

      {serverError && (
        <div className={styles.errorBox} role="alert">
          <Icon name="error" size={20} weight={600} fill={1} />
          <span className={styles.errorText}>{serverError}</span>
        </div>
      )}

      <div className={styles.grid}>
        <Field id="acc-fullName" label="Full name" required error={shownErrors.fullName}>
          <input
            id="acc-fullName"
            className={styles.input}
            type="text"
            value={fullName}
            maxLength={100}
            autoComplete="name"
            onChange={(e) => setFullName(e.target.value)}
            aria-required="true"
            aria-invalid={shownErrors.fullName ? 'true' : undefined}
            aria-describedby={shownErrors.fullName ? 'acc-fullName-error' : undefined}
          />
        </Field>

        {profile.username && (
          <Field id="acc-username" label="Username" hint="Used to sign in. It can’t be changed here." readOnly>
            <span className={styles.lead} aria-hidden="true">
              <Icon name="lock" size={18} />
            </span>
            <input
              id="acc-username"
              className={styles.input}
              type="text"
              value={profile.username}
              readOnly
              aria-readonly="true"
              aria-describedby="acc-username-hint"
            />
          </Field>
        )}

        <Field id="acc-email" label="Email" required error={shownErrors.email}>
          <input
            id="acc-email"
            className={styles.input}
            type="email"
            value={email}
            maxLength={254}
            autoComplete="email"
            inputMode="email"
            onChange={(e) => setEmail(e.target.value)}
            aria-required="true"
            aria-invalid={shownErrors.email ? 'true' : undefined}
            aria-describedby={shownErrors.email ? 'acc-email-error' : undefined}
          />
        </Field>

        <Field id="acc-phone" label="Phone number" error={shownErrors.phone} hint="Optional · mobile number">
          <span className={styles.prefix} aria-hidden="true">
            +94
          </span>
          <input
            id="acc-phone"
            className={styles.input}
            type="tel"
            inputMode="tel"
            value={phone}
            placeholder="77 123 4567"
            autoComplete="tel-national"
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            aria-invalid={shownErrors.phone ? 'true' : undefined}
            aria-describedby={shownErrors.phone ? 'acc-phone-error' : 'acc-phone-hint'}
          />
        </Field>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.neutralButton} onClick={discard} disabled={!dirty || saving}>
          Discard changes
        </button>
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={!dirty || saving}
          aria-busy={saving || undefined}
        >
          <span className={saving ? styles.spin : styles.iconSlot}>
            <Icon name={saving ? 'progress_activity' : 'check'} size={20} weight={600} />
          </span>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

// Label, boxed control (any leading icon / prefix + input), then the error or hint line.
function Field({ id, label, required, error, hint, readOnly, children }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.req} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <div className={`${styles.inputWrap} ${error ? styles.inputError : ''} ${readOnly ? styles.inputReadOnly : ''}`}>
        {children}
      </div>
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
