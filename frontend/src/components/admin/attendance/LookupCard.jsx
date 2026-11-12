import Icon from '@/components/admin/Icon';
import { tutorLabel } from '@/attendance/utils';
import styles from './attendance.module.css';

const MODES = [
  { key: 'barcode', label: 'Barcode', icon: 'barcode_scanner' },
  { key: 'phone', label: 'Phone', icon: 'call' },
];

function errorText(error) {
  if (!error) return '';
  if (error.type === 'invalid') return 'Enter a valid mobile number, e.g. 77 123 4567.';
  if (error.type === 'notfound' && error.by === 'phone') {
    return `No student found for phone number “${error.code}”. Check the number and try again.`;
  }
  if (error.type === 'notfound') return `No student found for barcode “${error.code}”. Check the card and scan again.`;
  return 'Couldn’t reach the server. Check the connection and try again.';
}

export default function LookupCard({
  mode,
  onModeChange,
  barcode,
  onBarcodeChange,
  phone,
  onPhoneChange,
  inputRef,
  tutors,
  tutorId,
  onTutorChange,
  date,
  minDate,
  maxDate,
  onDateChange,
  onSubmit,
  onClear,
  canClear,
  busy,
  error,
}) {
  const phoneMode = mode === 'phone';
  const inputInvalid = error?.type === 'empty' || error?.type === 'notfound' || error?.type === 'invalid';
  const inputId = phoneMode ? 'att-phone' : 'att-barcode';
  // An empty search has no banner: the page below shows the "Enter barcode or phone number" prompt instead.
  const showBanner = error && error.type !== 'empty';

  return (
    <section className={styles.card} aria-label="Look up a student">
      <form className={styles.lookupForm} onSubmit={onSubmit} noValidate>
        <div className={styles.lookupRow}>
          <div className={`${styles.field} ${styles.fieldMode}`}>
            <span className={styles.label} id="att-mode-label">
              Search by
            </span>
            <div className={styles.segment} role="group" aria-labelledby="att-mode-label">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={styles.segmentButton}
                  aria-pressed={mode === m.key}
                  onClick={() => onModeChange(m.key)}
                >
                  <Icon name={m.icon} size={20} weight={500} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`${styles.field} ${styles.fieldBarcode}`}>
            <label className={styles.label} htmlFor={inputId}>
              {phoneMode ? 'Phone number' : 'Student barcode'}
            </label>
            <div className={styles.control} data-invalid={inputInvalid || undefined}>
              {phoneMode ? (
                <>
                  <span className={styles.prefix} aria-hidden="true">
                    +94
                  </span>
                  <span className={styles.prefixRule} aria-hidden="true" />
                  <input
                    ref={inputRef}
                    key="phone"
                    id="att-phone"
                    className={styles.bareInput}
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    placeholder="77 123 4567"
                    autoComplete="off"
                    aria-invalid={inputInvalid || undefined}
                    aria-describedby={showBanner ? 'att-lookup-error' : undefined}
                  />
                </>
              ) : (
                <>
                  <span className={styles.controlIcon} aria-hidden="true">
                    <Icon name="barcode_scanner" size={22} weight={500} />
                  </span>
                  <input
                    ref={inputRef}
                    key="barcode"
                    id="att-barcode"
                    className={`${styles.bareInput} ${styles.mono}`}
                    type="text"
                    value={barcode}
                    onChange={(e) => onBarcodeChange(e.target.value)}
                    placeholder="Enter student Barcode ID"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    aria-invalid={inputInvalid || undefined}
                    aria-describedby={error ? 'att-lookup-error' : undefined}
                  />
                </>
              )}
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

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryButton} disabled={busy} aria-busy={busy || undefined}>
              <span className={busy ? styles.spin : undefined}>
                <Icon name={busy ? 'progress_activity' : 'search'} size={21} weight={600} />
              </span>
              {busy ? 'Checking…' : 'Check attendance'}
            </button>
            <button type="button" className={styles.clearButton} disabled={!canClear} onClick={onClear}>
              <Icon name="close" size={20} weight={600} />
              Clear
            </button>
          </div>
         </div>
  
        {showBanner && (
          <div id="att-lookup-error" className={styles.banner} role="alert">
            <Icon name="error" size={20} weight={600} fill={1} />
            <span className={styles.bannerText}>{errorText(error)}</span>
          </div>
        )}
      </form>

    </section>
  );
}
