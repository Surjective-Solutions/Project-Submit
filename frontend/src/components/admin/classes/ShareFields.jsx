import { SHARE_META } from '@/classes/constants';
import { digitsOnly, toNumber } from '@/classes/sessionUtils';
import Icon from '@/components/admin/Icon';
import s from './sessions.module.css';

// Revenue shares as percentages: Teacher, Institute and System. They must add up to 100.
export default function ShareFields({ shares, total, showError, onChange }) {
  const ok = total === 100;
  return (
    <div className={s.shares}>
      <div className={s.shareGrid}>
        {SHARE_META.map((item) => (
          <div key={item.key} className={s.shareField}>
            <label htmlFor={`share-${item.key}`} className={s.shareLabel}>
              <span className={s.shareDot} style={{ background: item.color }} aria-hidden="true" />
              {item.label}
            </label>
            <div className={`${s.shareInput} ${showError && !ok ? s.inputError : ''}`}>
              <input
                id={`share-${item.key}`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={shares[item.key]}
                onChange={(event) => onChange(item.key, digitsOnly(event.target.value, 3))}
                aria-label={`${item.label} share in percent`}
              />
              <span aria-hidden="true">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className={s.shareBar} aria-hidden="true">
        {SHARE_META.map((item) => (
          <span key={item.key} style={{ width: `${ok ? toNumber(shares[item.key]) : (toNumber(shares[item.key]) / Math.max(total, 1)) * 100}%`, background: item.color }} />
        ))}
      </div>

      <p className={`${s.shareTotal} ${ok ? s.shareTotalOk : s.shareTotalBad}`} role="status">
        <Icon name={ok ? 'check_circle' : 'error'} size={17} weight={600} fill={1} />
        Total {total}%{ok ? '' : ' — must be 100%'}
      </p>
    </div>
  );
}
