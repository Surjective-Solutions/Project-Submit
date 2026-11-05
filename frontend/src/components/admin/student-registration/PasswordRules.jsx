import Icon from '@/components/admin/Icon';
import flow from './flow.module.css';

// "Password must have" checklist. After a failed submit, rules that are still unmet turn red.
export default function PasswordRules({ id, rules, submitted }) {
  return (
    <div className={flow.rulesBox}>
      <p id={`${id}-title`} className={flow.rulesTitle}>
        Password must have
      </p>
      <ul id={id} className={flow.rulesList} aria-labelledby={`${id}-title`}>
        {rules.map((rule) => {
          const failed = submitted && !rule.met;
          const stateClass = rule.met ? flow.ruleMet : failed ? flow.ruleFailed : '';
          return (
            <li key={rule.id} className={`${flow.rule} ${stateClass}`} data-rule={rule.id} data-met={rule.met}>
              <span className={flow.ruleDot} aria-hidden="true">
                {rule.met ? <Icon name="check" size={14} weight={700} /> : failed ? <Icon name="close" size={14} weight={700} /> : null}
              </span>
              <span>
                {rule.label}
                <span className={flow.srOnly}>{rule.met ? ' (met)' : ' (not met)'}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
