'use client';

import Icon from '@/components/admin/Icon';
import { STATUS_TABS, SUBJECTS } from '@/study-packs/constants';
import styles from './study-packs.module.css';

export default function PackFilters({
  status,
  onStatusChange,
  counts,
  search,
  onSearchChange,
  subject,
  onSubjectChange,
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.tabs} role="tablist" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => {
          const active = tab.key === status;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => onStatusChange(tab.key)}
            >
              {tab.label}
              <span className={styles.tabCount}>{counts[tab.key]}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.toolbarRight}>
        <div className={styles.searchBox}>
          <Icon name="search" size={18} style={{ color: 'var(--syz-muted, #5b6178)' }} />
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search packs or teachers"
            aria-label="Search packs or teachers"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className={styles.subjectWrap}>
          <select
            className={styles.subjectSelect}
            aria-label="Filter by subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
          >
            <option value="">All subjects</option>
            {SUBJECTS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <span className={styles.selectChevron} aria-hidden="true">
            <Icon name="expand_more" size={20} />
          </span>
        </div>
      </div>
    </div>
  );
}
