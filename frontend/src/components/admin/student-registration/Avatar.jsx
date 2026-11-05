import Icon from '@/components/admin/Icon';
import styles from './registration.module.css';

// Round photo, or the initials when there is no photo. `size` is the diameter in px.
export default function Avatar({ photo, initials, size = 52, className = '' }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.34) };
  if (photo) {
    return <span className={`${styles.avatar} ${className}`} style={{ ...style, backgroundImage: `url(${photo})` }} role="img" aria-label="Student photo" />;
  }
  return (
    <span className={`${styles.avatar} ${styles.avatarInitials} ${className}`} style={style} aria-hidden="true">
      {initials || <Icon name="person" size={Math.round(size * 0.46)} />}
    </span>
  );
}
