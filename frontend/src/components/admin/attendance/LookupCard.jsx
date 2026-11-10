import Icon from '@/components/admin/Icon';
import { tutorLabel } from '@/attendance/utils';
import styles from './attendance.module.css';

function errorText(error) {
  if (!error) return '';
  if (error.type === 'empty') return 'Scan or type a student barcode first.';
  if (error.type === 'notfound') return `No student found for barcode “${error.code}”. Check the card and scan again.`;
  return 'Couldn’t reach the server. Check the connection and try again.';
}

export default function LookupCard({
  barcode,
  onBarcodeChange,
  inputRef,
  tutors,
  tutorId,
  onTutorChange,
  date,
  minDate,
  maxDate,
  onDateChange,
  onSubmit,
  busy,
  error,
  recents,
  currentId,
  onPickRecent,
}) {
  const barcodeInvalid = error?.type === 'empty' || error?.type === 'notfound';

  return (
    <section className={styles.card} aria-label="Look up a student">
      <form className={styles.lookupForm} onSubmit={onSubmit} noValidate>
        <div className={styles.lookupRow}>
          <div className={`${styles.field} ${styles.fieldBarcode}`}>
            <label className={styles.label} htmlFor="att-barcode">
              Student barcode
            </label>
            <div className={styles.control} data-invalid={barcodeInvalid || undefined}>
              <span className={styles.controlIcon} aria-hidden="true">
                <Icon name="barcode_scanner" size={22} weight={500} />
              </span>
              <input
                ref={inputRef}
                id="att-barcode"
                className={`${styles.bareInput} ${styles.mono}`}
                type="text"
                value={barcode}
                onChange={(e) => onBarcodeChange(e.target.value)}
                placeholder="Type student barcode ID"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-invalid={barcodeInvalid || undefined}
                aria-describedby={error ? 'att-barcode-error' : undefined}
              />
              <kbd className={styles.keyHint} aria-hidden="true">
                Enter ↵
              </kbd>
            </div>
          </div>

          <div className={`${styles.field} ${styles.fieldTutor}`}>
            <label className={styles.label} htmlFor="att-tutor">
              Tutor
            </label>
            <div className={styles.control} data-selected={tutorId ? 'true' : undefined}>
              <select
                id="att-tutor"
                className={styles.bareSelect}
                value={tutorId}
                onChange={(e) => onTutorChange(e.target.value)}
              >
                <option value="">All tutors</option>
                {tutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutorLabel(tutor)}
                  </option>
                ))}
              </select>
              <span className={styles.controlIcon} aria-hidden="true">
                <Icon name="expand_more" size={22} weight={500} />
              </span>
            </div>
          </div>

          <div className={`${styles.field} ${styles.fieldDate}`}>
            <label className={styles.label} htmlFor="att-date">
              Class date
            </label>
            <div className={styles.control}>
              <input
                id="att-date"
                className={styles.bareInput}
                type="date"
                value={date}
                min={minDate || undefined}
                max={maxDate || undefined}
                disabled={!date}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className={styles.primaryButton} disabled={busy} aria-busy={busy || undefined}>
            <span className={busy ? styles.spin : undefined}>
              <Icon name={busy ? 'progress_activity' : 'search'} size={21} weight={600} />
            </span>
            {busy ? 'Checking…' : 'Check attendance'}
          </button>
        </div>

        {error && (
          <div id="att-barcode-error" className={styles.banner} role="alert">
            <Icon name="error" size={20} weight={600} fill={1} />
            <span className={styles.bannerText}>{errorText(error)}</span>
          </div>
        )}
      </form>

      {recents.length > 0 && (
        <div className={styles.recents}>
          <span className={styles.recentsLabel}>Recent scans</span>
          {recents.map((recent) => (
            <button
              key={recent.id}
              type="button"
              className={styles.recentChip}
              aria-pressed={recent.id === currentId}
              onClick={() => onPickRecent(recent.id)}
            >
              <span className={styles.mono}>{recent.id}</span>
              <span>{recent.firstName}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
