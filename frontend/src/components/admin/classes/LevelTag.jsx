import { LEVEL_LABEL, LEVEL_META } from '@/classes/constants';
import styles from './classes.module.css';

// `long` spells the level out ("Advanced Level") instead of the short code ("A/L").
export default function LevelTag({ level, long = false }) {
  const meta = LEVEL_META[level] || LEVEL_META['A/L'];
  return (
    <span className={styles.levelTag} style={{ color: meta.color, background: meta.tint }}>
      {long ? LEVEL_LABEL[level] || level : level}
    </span>
  );
}
