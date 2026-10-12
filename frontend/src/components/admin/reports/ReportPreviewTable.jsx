'use client';

import styles from './reports.module.css';

export const PREVIEW_ROWS = 8;

export default function ReportPreviewTable({ columns, rows, granularity }) {
  const shown = rows.slice(0, PREVIEW_ROWS);

  return (
    <>
      <div className={styles.tableBox}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={column.numeric ? styles.numeric : undefined}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key} className={column.numeric ? styles.numeric : undefined}>
                    {column.format ? column.format(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.tableNote}>
        {`Showing ${shown.length} of ${rows.length} rows · the full report is in the download`}
        {granularity === 'month' ? ' · figures are per full month, so every month in the range is included' : ''}
      </p>
    </>
  );
}
