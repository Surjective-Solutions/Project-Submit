'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DISTRICTS, EMPTY_FORM, GRADES, MEDIUMS, STREAMS } from '@/student-registration/constants';
import { peekStudentId, students } from '@/student-registration/api';
import { PASSWORD_ROUTE } from '@/student-registration/routes';
import {
  examYearOptions,
  firstErrorField,
  formatPhoneInput,
  initialsOf,
  isAdvancedLevel,
  isOrdinaryLevel,
  toApiNumber,
  todayIso,
  validate,
} from '@/student-registration/utils';
import AddressField from './AddressField';
import DuplicateBanner from './DuplicateBanner';
import GenderToggle from './GenderToggle';
import PhotoUploader from './PhotoUploader';
import { useRegistrationFlow } from './RegistrationFlowContext';
import RegistrationSummary from './RegistrationSummary';
import SameAsCheckbox from './SameAsCheckbox';
import SectionCard from './SectionCard';
import SelectField from './SelectField';
import StepIndicator from './StepIndicator';
import TextField from './TextField';
import styles from './registration.module.css';

const PHONE_FIELDS = new Set(['contactNumber', 'guardianContact', 'whatsappNumber']);

export default function RegistrationPage() {
  const router = useRouter();
  const { pending, setPending, clear } = useRegistrationFlow();

  // Coming back from the Set Password page, the form is still filled in.
  const [form, setForm] = useState(() => pending?.form ?? EMPTY_FORM);
  const [sameWhatsapp, setSameWhatsapp] = useState(() => pending?.sameWhatsapp ?? true);
  const [photo, setPhoto] = useState(() => pending?.photo ?? null); // { dataUrl, file }
  const [submitted, setSubmitted] = useState(false); // errors show only after the first submit attempt
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [duplicate, setDuplicate] = useState(null); // { name, studentId }

  const bannerRef = useRef(null);

  const errors = useMemo(() => validate(form, { sameWhatsapp }), [form, sameWhatsapp]);
  const shown = submitted ? errors : {};
  const today = useMemo(() => todayIso(), []);
  const examYearList = useMemo(() => examYearOptions(), []);
  const ordinaryLevel = isOrdinaryLevel(form.grade);

  useEffect(() => {
    if (duplicate) {
      bannerRef.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      bannerRef.current?.focus({ preventScroll: true });
    }
  }, [duplicate]);

  function setField(name, rawValue) {
    let value = rawValue;
    if (PHONE_FIELDS.has(name)) value = formatPhoneInput(rawValue);
    else if (name === 'postalCode') value = rawValue.replace(/\D/g, '').slice(0, 5); // digits only
    setForm((current) => {
      const next = { ...current, [name]: value };
      // Switching to an O/L grade clears the stream.
      if (name === 'grade' && isOrdinaryLevel(value)) next.stream = '';
      return next;
    });
    if (name === 'contactNumber') setDuplicate(null);
    setSubmitError('');
  }

  function handleSameWhatsapp(checked) {
    setSameWhatsapp(checked);
    if (checked) setForm((current) => ({ ...current, whatsappNumber: '' }));
  }

  function reset() {
    setForm(EMPTY_FORM);
    setSameWhatsapp(true);
    setPhoto(null);
    setSubmitted(false);
    setSubmitError('');
    setDuplicate(null);
    clear();
  }

  function focusField(name) {
    const el = document.getElementById(`reg-${name}`);
    el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    el?.focus({ preventScroll: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitted(true);
    setSubmitError('');

    const invalid = firstErrorField(errors);
    if (invalid) {
      focusField(invalid);
      return;
    }

    setSubmitting(true);
    try {
      const existing = await students.checkDuplicate(toApiNumber(form.contactNumber));
      if (existing) {
        setDuplicate(existing);
        return;
      }
      // Nothing is saved yet: the details wait in memory while the admin sets the password (page 2).
      setPending({ form, sameWhatsapp, photo, studentId: peekStudentId(form.grade) });
      router.push(PASSWORD_ROUTE);
    } catch (err) {
      setSubmitError(err?.message || 'Could not check the contact number. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.h1}>Student Registration</h1>
          <p className={styles.subtitle}>
            Register a new student. Fields marked <span className={styles.req}>*</span> are required.
          </p>
        </div>
      </div>

      <StepIndicator step={1} />

      <form className={styles.layout} onSubmit={handleSubmit} noValidate aria-label="Register a student">
        <div className={styles.formCol}>
          {duplicate && <DuplicateBanner ref={bannerRef} duplicate={duplicate} />}

          <SectionCard
            id="student"
            icon="person"
            title="Student details"
            subtitle="The contact number becomes the student's login for OTP sign-in."
          >
            <div className={styles.grid}>
              <TextField
                id="reg-firstName"
                label="First name"
                required
                placeholder="Kavindi"
                autoComplete="off"
                maxLength={60}
                value={form.firstName}
                onChange={(e) => setField('firstName', e.target.value)}
                error={shown.firstName}
              />
              <TextField
                id="reg-lastName"
                label="Last name"
                required
                placeholder="Dissanayake"
                autoComplete="off"
                maxLength={60}
                value={form.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
                error={shown.lastName}
              />
              <TextField
                id="reg-contactNumber"
                label="Contact number"
                required
                prefix="+94"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                placeholder="77 123 4567"
                value={form.contactNumber}
                onChange={(e) => setField('contactNumber', e.target.value)}
                hint="Used to sign in with an SMS code"
                error={shown.contactNumber}
              />
              <TextField
                id="reg-dateOfBirth"
                label="Date of birth"
                required
                type="date"
                max={today}
                value={form.dateOfBirth}
                onChange={(e) => setField('dateOfBirth', e.target.value)}
                error={shown.dateOfBirth}
              />
              <GenderToggle id="reg-gender" value={form.gender} onChange={(value) => setField('gender', value)} error={shown.gender} />
            </div>
          </SectionCard>

          <SectionCard
            id="guardian"
            icon="family_restroom"
            title="Parent / Guardian"
            subtitle="Contacted for fee reminders, attendance and results."
          >
            <div className={styles.grid}>
              <TextField
                id="reg-guardianName"
                label="Guardian name"
                required
                placeholder="Sunil Dissanayake"
                autoComplete="off"
                maxLength={80}
                value={form.guardianName}
                onChange={(e) => setField('guardianName', e.target.value)}
                error={shown.guardianName}
              />
              <TextField
                id="reg-guardianContact"
                label="Guardian contact number"
                required
                prefix="+94"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                placeholder="71 456 7890"
                value={form.guardianContact}
                onChange={(e) => setField('guardianContact', e.target.value)}
                error={shown.guardianContact}
              />
            </div>
          </SectionCard>

          <SectionCard
            id="delivery"
            icon="local_shipping"
            title="Delivery details"
            subtitle="Study packs and tutes are posted here. Only the postal code is optional."
            required={null}
          >
            <div className={styles.grid}>
              <AddressField
                id="reg-address"
                value={form.address}
                onChange={(value) => setField('address', value)}
                error={shown.address}
                hint="Include the house number, street and area."
              />
              <TextField
                id="reg-city"
                label="City"
                required
                autoComplete="off"
                placeholder="Kandy"
                maxLength={60}
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                error={shown.city}
              />
              <TextField
                id="reg-postalCode"
                label="Postal code (optional)"
                inputMode="numeric"
                autoComplete="off"
                placeholder="20400"
                maxLength={5}
                value={form.postalCode}
                onChange={(e) => setField('postalCode', e.target.value)}
                error={shown.postalCode}
              />
              <SelectField
                id="reg-district"
                label="District"
                required
                placeholder="Select district"
                options={DISTRICTS}
                value={form.district}
                onChange={(value) => setField('district', value)}
                error={shown.district}
              />
            </div>
          </SectionCard>

          <SectionCard
            id="additional"
            icon="add_circle"
            title="Additional information"
            subtitle="Only the profile picture and NIC are optional."
            required={null}
          >
            <PhotoUploader photo={photo} initials={initialsOf(form)} onChange={setPhoto} />

            <hr className={styles.divider} />

            <div className={styles.grid}>
              <TextField
                id="reg-email"
                label="Email"
                required
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder="student@gmail.com"
                maxLength={100}
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                error={shown.email}
              />
              <TextField
                id="reg-school"
                label="School"
                required
                autoComplete="off"
                placeholder="Mahamaya Girls' College, Kandy"
                maxLength={100}
                value={form.school}
                onChange={(e) => setField('school', e.target.value)}
                error={shown.school}
              />
              <TextField
                id="reg-nic"
                label="NIC (optional)"
                autoComplete="off"
                placeholder="200912345678"
                maxLength={12}
                value={form.nic}
                onChange={(e) => setField('nic', e.target.value)}
                hint="New (12 digits) or old (9 digits + V) format"
                error={shown.nic}
              />
            </div>

            <SameAsCheckbox id="reg-sameWhatsapp" checked={sameWhatsapp} onChange={handleSameWhatsapp} />
            {!sameWhatsapp && (
              <div className={styles.grid}>
                <TextField
                  id="reg-whatsappNumber"
                  label="WhatsApp number"
                  required
                  prefix="+94"
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  placeholder="77 123 4567"
                  value={form.whatsappNumber}
                  onChange={(e) => setField('whatsappNumber', e.target.value)}
                  error={shown.whatsappNumber}
                />
              </div>
            )}

            <div className={`${styles.grid} ${styles.gridSelects}`}>
              <SelectField
                id="reg-grade"
                label="Grade"
                required
                placeholder="Select grade"
                options={GRADES}
                value={form.grade}
                onChange={(value) => setField('grade', value)}
                error={shown.grade}
              />
              <SelectField
                id="reg-stream"
                label="Subject stream"
                required={isAdvancedLevel(form.grade)}
                placeholder={ordinaryLevel ? 'Not needed for O/L' : form.grade ? 'Select stream' : 'Select a grade first'}
                options={STREAMS}
                value={form.stream}
                disabled={!isAdvancedLevel(form.grade)}
                onChange={(value) => setField('stream', value)}
                hint={ordinaryLevel ? 'Streams apply to A/L students only.' : undefined}
                error={shown.stream}
              />
              <SelectField
                id="reg-medium"
                label="Medium"
                required
                placeholder="Select medium"
                options={MEDIUMS}
                value={form.medium}
                onChange={(value) => setField('medium', value)}
                error={shown.medium}
              />
              <SelectField
                id="reg-examYear"
                label="Exam year"
                required
                placeholder="Select exam year"
                options={examYearList}
                value={form.examYear}
                onChange={(value) => setField('examYear', value)}
                error={shown.examYear}
              />
            </div>
          </SectionCard>
        </div>

        <RegistrationSummary
          form={form}
          errors={errors}
          submitted={submitted}
          sameWhatsapp={sameWhatsapp}
          photoUrl={photo?.dataUrl || ''}
          studentId={peekStudentId(form.grade)}
          submitting={submitting}
          submitError={submitError}
          onClear={reset}
        />
      </form>
    </div>
  );
}
