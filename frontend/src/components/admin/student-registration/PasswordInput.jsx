import { useState } from 'react';
import Icon from '@/components/admin/Icon';
import flow from './flow.module.css';

// Password field: key icon, show / hide button. `state` is 'error', 'ok' or undefined.
export default function PasswordInput({ id, label, value, onChange, state, describedBy }) {
  const [visible, setVisible] = useState(false);
  const wrapClass = [flow.pwWrap, state === 'error' ? flow.pwWrapError : '', state === 'ok' ? flow.pwWrapOk : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={flow.pwField}>
      <label htmlFor={id} className={flow.label}>
        {label}
        <span className={flow.req} aria-hidden="true">
          {' '}
          *
        </span>
      </label>
      <div className={wrapClass}>
        <span className={flow.pwLead} aria-hidden="true">
          <Icon name="key" size={20} />
        </span>
        <input
          id={id}
          className={flow.pwInput}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          maxLength={64}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-required="true"
          aria-invalid={state === 'error' ? 'true' : undefined}
          aria-describedby={describedBy}
          spellCheck={false}
          autoCapitalize="none"
        />
        <button
          type="button"
          className={flow.eyeButton}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} size={20} />
        </button>
      </div>
    </div>
  );
}
