'use client';

import Icon from '@/components/admin/Icon';
import StatusChip from './StatusChip';
import { getInitials } from '@/mocks/staff';
import styles from './staff.module.css';

function Cell({ main, sub }) {
  return (
    <div className={styles.cellStack}>
      <span className={styles.cellMain}>{main}</span>
      {sub ? <span className={styles.cellSub}>{sub}</span> : null}
    </div>
  );
}

function getColumns(categoryKey) {
  switch (categoryKey) {
    case 'teachers':
      return [
        { key: 'name', header: 'Teacher' },
        { key: 'subject', header: 'Subject', cell: (p) => <Cell main={p.subject} sub={p.stream} /> },
        { key: 'medium', header: 'Medium', cell: (p) => <Cell main={p.medium} /> },
        {
          key: 'students',
          header: 'Students',
          cell: (p) => <Cell main={p.enrolledStudents.toLocaleString()} />,
        },
        { key: 'status', header: 'Status', cell: (p) => <StatusChip status={p.status} /> },
      ];
    case 'instructors':
      return [
        { key: 'name', header: 'Instructor' },
        { key: 'assists', header: 'Assists', cell: (p) => <Cell main={p.assists} sub={p.subject} /> },
        { key: 'status', header: 'Status', cell: (p) => <StatusChip status={p.status} /> },
      ];
    case 'cashiers':
      return [
        { key: 'name', header: 'Cashier' },
        { key: 'status', header: 'Status', cell: (p) => <StatusChip status={p.status} /> },
      ];
    default:
      return [];
  }
}

export default function StaffTable({ category, people, selectedId, onSelect, emptyLabel }) {
  const columns = getColumns(category.key);

  if (people.length === 0) {
    return <div className={styles.emptyState}>{emptyLabel}</div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
            <th aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr
              key={person.id}
              className={person.id === selectedId ? `${styles.row} ${styles.rowSelected}` : styles.row}
              onClick={() => onSelect(person)}
            >
              {columns.map((col) =>
                col.key === 'name' ? (
                  <td key={col.key}>
                    <div className={styles.nameCell}>
                      <span
                        className={styles.avatar}
                        style={{
                          background: category.avatarColors.bg,
                          color: category.avatarColors.color,
                        }}
                      >
                        {getInitials(person.fullName)}
                      </span>
                      <span className={styles.nameText}>
                        <span className={styles.cellMain}>{person.fullName}</span>
                        <span className={styles.cellSub}>{person.mobile}</span>
                      </span>
                    </div>
                  </td>
                ) : (
                  <td key={col.key}>{col.cell(person)}</td>
                ),
              )}
              <td className={styles.chevronCell}>
                <Icon name="chevron_right" size={18} style={{ color: 'var(--syz-muted)' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}