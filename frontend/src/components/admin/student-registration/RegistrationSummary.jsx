import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { GUARDIAN_FIELDS, STUDENT_FIELDS, DELIVERY_FIELDS } from '@/student-registration/constants';
import {
  DELIVERY_TOTAL,
  GUARDIAN_TOTAL,
  STUDENT_TOTAL,
  countDone,
  fullName,
  initialsOf,
  requiredAdditionalFields,
} from '@/student-registration/utils';
import Avatar from './Avatar';
import styles from './registration.module.css';

// One checklist row: status circle, label and a count / "Done".
function CheckRow({ label, total, count, submitted }) {
  const complete = count === total;
  const failed = !complete && submitted;

  let circle = styles.circleIdle;
  let circleContent = null;
  if (complete) {
    circle = styles.circleDone;
    circleContent = <Icon name="check" size={14} weight={700} />;
  } else if (failed) {
    circle = styles.circleFailed;
    circleContent = '!';
  }

  let badgeClass = styles.countIdle;
  if (complete) badgeClass = styles.countDone;
  else if (failed) badgeClass = styles.countFailed;

  return (
    <li className={styles.checkItem}>
      <span className={`${styles.circle} ${circle}`} aria-hidden="true">
        {circleContent}
      </span>
      <span className={styles.checkItemLabel}>{label}</span>
      <span className={`${styles.countBadge} ${badgeClass}`}>
        {complete ? 'Done' : `${count} / ${total}`}
        {failed && <span className={styles.srOnly}> incomplete</span>}
      </span>
    </li>
  );
}

export default function RegistrationSummary({
  form,
  errors,
  submitted,
  sameWhatsapp,
  photoUrl,
  studentId,
  submitting,
  submitError,
  onClear,
}) {
  const studentDone = countDone(STUDENT_FIELDS, errors);
  const guardianDone = countDone(GUARDIAN_FIELDS, errors);
  const deliveryDone = countDone(DELIVERY_FIELDS, errors);
  
  // The stream (A/L only) and the WhatsApp number (when different) are required only in some cases.
  const additionalNames = requiredAdditionalFields(form, { sameWhatsapp });
  const additionalDone = countDone(additionalNames, errors);
  const additionalTotal = additionalNames.length;
  const requiredDone = studentDone + guardianDone + deliveryDone + additionalDone;
  const requiredTotal = STUDENT_TOTAL + GUARDIAN_TOTAL + DELIVERY_TOTAL + additionalTotal;

  const errorCount = Object.keys(errors).length;
  const name = fullName(form);

  return (
    <aside className={styles.aside} aria-label="Registration summary">
      <div className={styles.card}>
        <div className={styles.summaryHead}>
          <Avatar photo={photoUrl} initials={initialsOf(form)} size={52} className={styles.summaryAvatar} />
          <div className={styles.summaryWho}>
            <p className={styles.summaryName}>{name || 'New student'}</p>
            <p className={styles.summaryId}>
              <span className={styles.srOnly}>Student ID </span>
              {studentId}
            </p>
          </div>
        </div>

        <div>
          <div className={styles.progressHead}>
            <span>Required details</span>
            <strong>
              {requiredDone} / {requiredTotal}
            </strong>
          </div>
          <div
            className={styles.progress}
            role="progressbar"
            aria-label="Required details completed"
            aria-valuemin={0}
            aria-valuemax={requiredTotal}
            aria-valuenow={requiredDone}
          >
            <span className={styles.progressFill} style={{ width: `${(requiredDone / requiredTotal) * 100}%` }} />
          </div>
        </div>

        <ul className={styles.checklist}>
          <CheckRow label="Student details" count={studentDone} total={STUDENT_TOTAL} submitted={submitted} />
          <CheckRow label="Parent / guardian" count={guardianDone} total={GUARDIAN_TOTAL} submitted={submitted} />
          <CheckRow label="Delivery details" count={deliveryDone} total={DELIVERY_TOTAL} submitted={submitted} />
          <CheckRow label="Additional information" count={additionalDone} total={additionalTotal} submitted={submitted} />
        </ul>

        {submitted && errorCount > 0 && (
          <div className={styles.errorBox} role="alert">
            {errorCount} {errorCount === 1 ? 'item needs' : 'items need'} attention. Check the fields marked in red.
          </div>
        )}
        {submitError && (
          <div className={styles.errorBox} role="alert">
            {submitError}
          </div>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.primaryButton} disabled={submitting} aria-busy={submitting || undefined}>
            <span className={submitting ? styles.spin : styles.iconSlot}>
              <Icon name={submitting ? 'progress_activity' : 'how_to_reg'} size={21} weight={600} />
            </span>
            {submitting ? 'Registering…' : 'Register student'}
          </button>
          <button type="button" className={styles.neutralButton} onClick={onClear} disabled={submitting}>
            Clear form
          </button>
        </div>
      </div>

      <div className={styles.note}>
        <Icon name="sms" size={20} style={{ color: '#223385' }} />
        <p>
          The student signs in with an SMS code sent to their contact number. The account locks to the first device they use; unlock it from{' '}
          <Link href="/admin/students" className={styles.noteLink}>
            Students
          </Link>
          .
        </p>
      </div>
    </aside>
  );
}
