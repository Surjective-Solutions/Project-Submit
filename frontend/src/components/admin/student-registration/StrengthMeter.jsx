import flow from './flow.module.css';

// Four segments and a label. `strength` = { level 0-4, label, color } from passwordStrength().
export default function StrengthMeter({ id, strength }) {
  return (
    <div id={id} className={flow.meter}>
      <div className={flow.meterBars} aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={flow.meterBar}
            style={segment <= strength.level ? { background: strength.color } : undefined}
          />
        ))}
      </div>
      <span className={flow.meterLabel} style={strength.level ? { color: strength.level === 2 ? '#7a6a00' : strength.color } : undefined}>
        <span className={flow.srOnly}>Password strength: </span>
        {strength.label}
      </span>
    </div>
  );
}
