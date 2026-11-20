'use client';

import Icon from '@/components/admin/Icon';
import { STATUS_TABS, SUBJECTS } from '@/study-packs/constants';
import GlideSelect from './GlideSelect';
import './PackFilters.css';
import styles from './study-packs.module.css';

// Look of the filter dropdown. Change the colours / size here and it changes in both the admin and teacher accounts.
const GLIDE_STYLE = {
  showTags: false,
  accentColor: '#f5f5f5',
  surfaceColor: '#3940A0', // the pop-up menu (the button itself is see-through, see PackFilters.css)
  highlightColor: '#5159C9',
  textColor: '#f5f5f5',
  size: 'lg',
  radius: 10,
  menuWidth: 220,
  placement: 'bottom',
  align: 'right',
  popDuration: 180,
  glideDuration: 220,
  rememberPosition: true,
  className: 'pack-filter',
};

const subjectChoices = [{ value: '', label: 'All subjects' }, ...SUBJECTS.map((name) => ({ value: name, label: name }))];

// The right-hand dropdown filters by subject. In the teacher account (one teacher, one subject) pass `batchOptions`
// (the grades / batches to choose from, e.g. 'Grade 13 · A/L 2026') with `batch` and `onBatchChange`: it then filters by
// batch instead, and `searchLabel` can drop "teachers" from the search box.
export default function PackFilters({
  status,
  onStatusChange,
  counts,
  search,
  onSearchChange,
  subject,
  onSubjectChange,
  batchOptions = null,
  batch = '',
  onBatchChange,
  searchLabel = 'Search packs or teachers',
}) {
  const byBatch = Array.isArray(batchOptions);
  const batchChoices = [{ value: '', label: 'All batches' }, ...(batchOptions ?? []).map((name) => ({ value: name, label: name }))];
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
            placeholder={searchLabel}
            aria-label={searchLabel}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {byBatch ? (
          <GlideSelect
            ariaLabel="Filter by batch"
            options={batchChoices}
            value={batch}
            onChange={(next) => onBatchChange(next)}
            {...GLIDE_STYLE}
          />
        ) : (
          <GlideSelect
            ariaLabel="Filter by subject"
            options={subjectChoices}
            value={subject}
            onChange={(next) => onSubjectChange(next)}
            {...GLIDE_STYLE}
          />
        )}
      </div>
    </div>
  );
}
