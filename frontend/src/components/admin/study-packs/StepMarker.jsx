'use client';

import Icon from '@/components/admin/Icon';
import s from './add-recordings.module.css';

// The two-step marker. On step 2 the first pill is done and clickable (back to General settings).
export default function StepMarker({ step, onGoToSettings }) {
  const onSecond = step === 2;

  return (
    <ol className={s.markerList} aria-label="Steps">
      <li aria-current={onSecond ? undefined : 'step'}>
        {onSecond ? (
          <button type="button" className={`${s.pill} ${s.pillDone}`} onClick={onGoToSettings}>
            <span className={s.checkCircle}>
              <Icon name="check" size={14} weight={700} />
            </span>
            General settings
          </button>
        ) : (
          <span className={`${s.pill} ${s.pillCurrent}`}>
            <span className={s.numCircle}>1</span>
            General settings
          </span>
        )}
      </li>
      <li className={onSecond ? `${s.connector} ${s.connectorDone}` : s.connector} aria-hidden="true" />
      <li aria-current={onSecond ? 'step' : undefined}>
        <span className={onSecond ? `${s.pill} ${s.pillCurrent}` : s.pill}>
          <span className={onSecond ? s.numCircle : s.numCircleIdle}>2</span>
          Recordings &amp; materials
        </span>
      </li>
    </ol>
  );
}
