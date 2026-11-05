import Icon from '@/components/admin/Icon';
import flow from './flow.module.css';

const STEPS = ['Student details', 'Set password', 'Account ready'];

// "Student details → Set password → Account ready". `step` is the current step (1 to 3).
export default function StepIndicator({ step }) {
  return (
    <ol className={flow.steps} aria-label="Registration progress">
      {STEPS.map((label, index) => {
        const number = index + 1;
        const done = number < step;
        const current = number === step;
        const circle = done ? flow.stepCircleDone : current ? flow.stepCircleCurrent : '';
        return (
          <li key={label} className={flow.step} aria-current={current ? 'step' : undefined}>
            {index > 0 && <span className={`${flow.stepLine} ${number <= step ? flow.stepLineDone : ''}`} aria-hidden="true" />}
            <span className={`${flow.stepCircle} ${circle}`} aria-hidden="true">
              {done ? <Icon name="check" size={16} weight={700} /> : number}
            </span>
            <span className={`${flow.stepLabel} ${current ? flow.stepLabelCurrent : ''}`}>
              {label}
              {done && <span className={flow.srOnly}> (completed)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
