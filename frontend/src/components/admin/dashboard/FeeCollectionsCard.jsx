import { FEE_COLLECTIONS, PAYMENT_METHODS } from './dashboard-data';
import { percent } from './format';
import styles from './dashboard.module.css';

const Y_MAX = 25; // LKR millions
const Y_TICKS = [0, 5, 10, 15, 20, 25];
// Fills too light to read against white (under 1.5:1) get an inset edge.
const LOW_CONTRAST = new Set(['#F3E895']);

const toPct = (value) => `${(value / Y_MAX) * 100}%`;
const millions = (value) => `${value.toFixed(1)}M`;

function MonthBar({ label, value, target }) {
  const isCurrent = target != null;
  const top = isCurrent ? Math.max(value, target) : value;
  const remaining = isCurrent ? Math.max(0, target - value) : 0;
  const description = isCurrent
    ? `${label}: LKR ${millions(value)} collected of ${millions(target)} target, ${percent(value, target)}%`
    : `${label}: LKR ${millions(value)} collected`;

  return (
    <div className={styles.barCol} tabIndex={0} role="img" aria-label={description}>
      <div className={styles.barStack} style={{ height: toPct(top) }}>
        {remaining > 0 && (
          <>
            <div className={styles.barCap} style={{ flex: `${remaining} 1 0` }} />
            <span className={styles.barCapLabel} aria-hidden="true">
              Target {millions(target)}
            </span>
          </>
        )}
        <div
          className={isCurrent ? `${styles.barFill} ${styles.barCurrent}` : styles.barFill}
          style={{ flex: `${value} 1 0` }}
        />
        <div className={styles.tooltip} aria-hidden="true">
          <strong>{label}</strong>
          <br />
          LKR {millions(value)} collected
          {isCurrent && (
            <>
              <br />
              {millions(remaining)} to reach {millions(target)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeeCollectionsCard() {
  const current = FEE_COLLECTIONS[FEE_COLLECTIONS.length - 1];
  const first = FEE_COLLECTIONS[0];

  return (
    <section className={`${styles.card} ${styles.feeCard}`} aria-labelledby="fee-title">
      <div className={styles.cardHeader}>
        <div>
          <h2 id="fee-title" className={styles.cardTitle}>
            Fee collections
          </h2>
          <p className={styles.cardSub}>
            LKR millions · {first.label}–{current.label}
          </p>
        </div>
        <div className={styles.feeSummary}>
          <strong>LKR {millions(current.value)}</strong>
          {percent(current.value, current.target)}% of {current.label} target
        </div>
      </div>

      <div className={styles.chart}>
        {Y_TICKS.map((tick) => (
          <div
            key={tick}
            className={tick === 0 ? `${styles.gridLine} ${styles.gridLineBase}` : styles.gridLine}
            style={{ bottom: toPct(tick) }}
            aria-hidden="true"
          >
            <span className={styles.tick}>{tick}</span>
          </div>
        ))}
        <div className={styles.bars}>
          {FEE_COLLECTIONS.map((m) => (
            <MonthBar key={m.month} {...m} />
          ))}
        </div>
      </div>
      <div className={styles.xAxis} aria-hidden="true">
        {FEE_COLLECTIONS.map((m) => (
          <span key={m.month} className={m.target != null ? styles.xCurrent : undefined}>
            {m.month}
          </span>
        ))}
      </div>

      <div className={styles.chartLegend} aria-hidden="true">
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ background: '#AEB8DC' }} />
          Previous months
        </span>
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ background: 'var(--syz-blue)' }} />
          {current.label} so far
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchStriped}`} />
          Remaining to target
        </span>
      </div>

      <div className={styles.methodSection}>
        <h3 className={styles.methodTitle}>{current.label} by payment method</h3>
        <div className={styles.methodBar} aria-hidden="true">
          {PAYMENT_METHODS.map((m) => (
            <div
              key={m.key}
              className={
                LOW_CONTRAST.has(m.color) ? `${styles.methodSegment} ${styles.methodSegmentLight}` : styles.methodSegment
              }
              style={{ flex: `${m.share} 1 0`, background: m.color }}
            >
              <div className={styles.tooltip}>
                <strong>{m.label}</strong> · {m.share}%
              </div>
            </div>
          ))}
        </div>
        <ul className={styles.methodLegend}>
          {PAYMENT_METHODS.map((m) => (
            <li key={m.key}>
              <span
                className={LOW_CONTRAST.has(m.color) ? `${styles.swatch} ${styles.methodSegmentLight}` : styles.swatch}
                style={{ background: m.color }}
                aria-hidden="true"
              />
              {m.label} <strong>{m.share}%</strong>
              <span className={styles.methodAmount}>LKR {millions((current.value * m.share) / 100)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
