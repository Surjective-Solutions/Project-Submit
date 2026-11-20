'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { buildCsv, downloadCsv, reportFileName } from '@/reports/csv';
import { todayDateKey } from '@/reports/dates';
import { resolvePeriod } from '@/reports/periods';
import { getMe } from '@/study-packs/teacherApi';
import { generateReportPdf } from '@/teacher-reports/api';
import { getReportType, reportTeacher } from '@/teacher-reports/config';
import DownloadButtons from './DownloadButtons';
import PeriodPicker from './PeriodPicker';
import ReportPreviewTable from './ReportPreviewTable';
import ReportTypeSelect from './ReportTypeSelect';
import StepHeader from './StepHeader';
import Toast from './Toast';
import TotalTile from './TotalTile';
import styles from './reports.module.css';

const TOAST_MS = 4000;

// The teacher's Reports: the same three steps as the admin account (report type, period, preview and download), but
// only for the signed-in teacher, so there is no teacher to pick.
export default function TeacherReportsPage() {
  // Used for the date limits. Fixed for the lifetime of the page.
  const [todayKey] = useState(() => todayDateKey());
  const [typeKey, setTypeKey] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [toast, setToast] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [me, setMe] = useState(null);
  const [meError, setMeError] = useState('');
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Who is signed in, from the login token. The page never lets anyone report on another teacher.
  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((result) => {
        if (!cancelled) setMe(result);
      })
      .catch((err) => {
        if (!cancelled) setMeError(err?.message || 'Could not load your details. Please refresh the page.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function showToast(message) {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(''), TOAST_MS);
  }

  const type = getReportType(typeKey);
  const teacher = useMemo(() => (me ? reportTeacher(me) : null), [me]);
  const period = useMemo(() => resolvePeriod({ from, to }, todayKey), [from, to, todayKey]);

  const rangeError = period.error;
  const ready = Boolean(type && teacher && period.valid);

  // Rows are rebuilt only when the inputs change. Same inputs always give the same rows.
  const rows = useMemo(() => {
    if (!ready) return [];
    return type.generateRows({ teachers: [teacher], months: period.months, from: period.from, to: period.to, todayKey });
  }, [ready, type, teacher, period, todayKey]);

  const totals = useMemo(() => (ready ? type.totals(rows) : []), [ready, type, rows]);

  // ── Step states ──
  const step1State = type ? 'done' : 'current';
  const step2State = !type ? 'idle' : ready ? 'done' : 'current';
  const step3State = ready ? 'current' : 'idle';

  const step2Subtitle = !type ? 'Choose a report type first' : ready ? period.label : '';
  const step3Subtitle = ready ? `${type.title} · ${rows.length.toLocaleString('en-US')} rows` : 'Preview and download';

  // The empty box names the first thing still missing.
  let emptyPrompt = 'Choose a report type to begin';
  if (type && !teacher) emptyPrompt = meError ? 'Your details could not be loaded' : 'Loading your details…';
  else if (type && (!from || !to)) emptyPrompt = 'Choose a time period';
  else if (type && !period.valid) emptyPrompt = 'Fix the date range';

  function handleCsv() {
    if (!ready) return;
    const fileName = reportFileName(type, teacher, period, 'csv');
    downloadCsv(fileName, buildCsv(type.columns, rows));
    showToast(`Downloaded ${fileName}`);
  }

  async function handlePdf() {
    if (!ready || pdfBusy) return;
    setPdfBusy(true);
    try {
      const result = await generateReportPdf(type, teacher, period);
      if (result?.generated) {
        showToast(`Downloaded ${reportFileName(type, teacher, period, 'pdf')}`);
      } else {
        showToast('PDF export isn’t connected yet. Use CSV for now.');
      }
    } catch {
      showToast('Could not generate the PDF. Please try again.');
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Reports</h2>
      </header>

      {meError ? (
        <p className={styles.rangeError} role="alert">
          <Icon name="error" size={16} fill={1} />
          {meError}
        </p>
      ) : null}

      {/* Step 1 */}
      <section className={styles.card} aria-label="Step 1: Report type">
        <StepHeader number={1} title="Report type" state={step1State} />
        <ReportTypeSelect value={typeKey} onChange={setTypeKey} />
      </section>

      {/* Step 2 */}
      <section
        className={`${styles.card} ${!type ? styles.cardDisabled : ''}`}
        aria-label="Step 2: Time period"
        aria-disabled={!type}
      >
        <StepHeader number={2} title="Time period" subtitle={step2Subtitle} state={step2State} />
        {/* A disabled fieldset disables every control inside it until a type is chosen. */}
        <fieldset className={styles.cardBody} disabled={!type}>
          <PeriodPicker
            todayKey={todayKey}
            from={from}
            to={to}
            error={rangeError}
            onFromChange={setFrom}
            onToChange={setTo}
          />
        </fieldset>
      </section>

      {/* Step 3 */}
      <section className={styles.card} aria-label="Step 3: Preview and download">
        <StepHeader
          number={3}
          title="Preview and download"
          subtitle={step3Subtitle}
          state={step3State}
          right={<DownloadButtons disabled={!ready} pdfBusy={pdfBusy} onCsv={handleCsv} onPdf={handlePdf} />}
        />

        {ready ? (
          <>
            <div className={styles.chips}>
              <span className={styles.chip}>{type.title}</span>
              <span className={styles.chip}>{teacher.name}</span>
              <span className={styles.chip}>{period.label}</span>
            </div>
            <div className={styles.totals}>
              {totals.map((total) => (
                <TotalTile key={total.label} label={total.label} value={total.value} />
              ))}
            </div>
            <ReportPreviewTable columns={type.columns} rows={rows} granularity={type.granularity} />
          </>
        ) : (
          <div className={styles.emptyBox}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <Icon name="description" size={32} />
            </span>
            <span className={styles.emptyPrompt}>{emptyPrompt}</span>
            <span className={styles.emptyHint}>A preview of the report appears here before you download.</span>
          </div>
        )}
      </section>

      <Toast message={toast} />
    </div>
  );
}
