import { ALL, CLASS_TYPES, TYPE_LABEL, TYPE_META } from '@/classes/constants';
import styles from './classes.module.css';

function Pill({ active, onClick, children, count, dot }) {
  return (
    <button type="button" className={styles.pill} aria-pressed={active} onClick={onClick}>
      {dot && <span className={styles.pillDot} style={{ background: dot }} aria-hidden="true" />}
      {children}
      <span className={styles.pillCount}>{count}</span>
    </button>
  );
}

// Two rows of pill buttons. Each count already respects the other row's choice (see batchCounts / typeCounts).
export default function ClassFilters({ batches, batch, type, batchCounts, typeCounts, onBatch, onType }) {
  return (
    <section className={styles.filters} aria-label="Filter classes">
      <div className={styles.filterRow}>
        <span className={styles.filterLabel} id="filter-batch-label">
          Batch
        </span>
        <div className={styles.pills} role="group" aria-labelledby="filter-batch-label">
          <Pill active={batch === ALL} count={batchCounts[ALL] ?? 0} onClick={() => onBatch(ALL)}>
            All batches
          </Pill>
          {batches.map((option) => (
            <Pill
              key={option.key}
              active={batch === option.key}
              count={batchCounts[option.key] ?? 0}
              onClick={() => onBatch(option.key)}
            >
              {option.label}
            </Pill>
          ))}
        </div>
      </div>

      <div className={styles.filterRow}>
        <span className={styles.filterLabel} id="filter-type-label">
          Type
        </span>
        <div className={styles.pills} role="group" aria-labelledby="filter-type-label">
          <Pill active={type === ALL} count={typeCounts[ALL] ?? 0} onClick={() => onType(ALL)}>
            All types
          </Pill>
          {CLASS_TYPES.map((name) => (
            <Pill
              key={name}
              active={type === name}
              count={typeCounts[name] ?? 0}
              dot={TYPE_META[name].color}
              onClick={() => onType(name)}
            >
              {TYPE_LABEL[name] || name}
            </Pill>
          ))}
        </div>
      </div>
    </section>
  );
}
