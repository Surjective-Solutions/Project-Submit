'use client';

import Icon from '@/components/admin/Icon';
import styles from './reports.module.css';

export default function DownloadButtons({ disabled, pdfBusy, onCsv, onPdf }) {
  return (
    <div className={styles.downloadButtons}>
      <button type="button" className={styles.csvButton} disabled={disabled} onClick={onCsv}>
        <Icon name="download" size={18} weight={600} />
        CSV
      </button>
      <button type="button" className={styles.pdfButton} disabled={disabled || pdfBusy} onClick={onPdf}>
        <Icon name="picture_as_pdf" size={18} weight={600} fill={1} />
        PDF
      </button>
    </div>
  );
}
