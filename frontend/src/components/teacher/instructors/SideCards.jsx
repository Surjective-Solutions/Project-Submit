import { CheckIcon, LockIcon } from './icons';
import styles from './instructors.module.css';

const STEPS = [
  'Ask the instructor for their Instructor ID. They’ll find it on their Syzygy profile.',
  'Enter it above and check the name matches the person you expect.',
  'Add them. They get access to all your classes straight away.',
];

const CAN = [
  'View all classes and sessions',
  'Mark and edit attendance',
  'Upload recordings and resources',
  'Publish notices to students',
];

const ONLY_YOU = [
  'See payments and earnings',
  'Change class fees or delete classes',
  'Add or remove instructors',
];

// "How it works": sits beside the add form.
export function HowItWorksCard() {
  return (
    <section className={styles.card} aria-labelledby="ins-how">
      <h2 id="ins-how" className={styles.cardTitle}>How it works</h2>
      <ol className={styles.steps}>
        {STEPS.map((step, i) => (
          <li key={step} className={styles.step}>
            <span className={styles.stepNo} aria-hidden="true">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// What an instructor can and can't do: one full-width card under the list, in two columns.
export function AccessCard() {
  return (
    <section className={`${styles.card} ${styles.accessCard}`} aria-label="What instructors can do">
      <div>
        <h2 className={styles.cardTitle}>What instructors can do</h2>
        <ul className={styles.ticks}>
          {CAN.map((item) => (
            <li key={item} className={styles.tick}>
              <span className={styles.tickIcon}><CheckIcon size={16} strokeWidth={2.6} /></span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.accessOnly}>
        <h3 className={styles.onlyYou}>Only you can</h3>
        <ul className={styles.ticks}>
          {ONLY_YOU.map((item) => (
            <li key={item} className={styles.tick}>
              <span className={styles.lockIcon}><LockIcon size={15} /></span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
