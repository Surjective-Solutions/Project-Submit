'use client';

import Icon from '@/components/admin/Icon';
import Dialog from './Dialog';
import styles from './classes.module.css';
import s from './sessions.module.css';

// Analytics gets its own window. What goes inside it is still to be decided, so it shows a placeholder for now.
export const CLASS_PANELS = {
  analytics: { title: 'Analytics', icon: 'monitoring', text: 'Attendance, payments and engagement for this class will be shown here.' },
};

export default function ClassPanelDialog({ panel, name, onClose }) {
  const info = CLASS_PANELS[panel];
  return (
    <Dialog
      title={info.title}
      titleId="class-panel-title"
      icon={info.icon}
      size="lg"
      onClose={onClose}
      footer={
        <button type="button" className={styles.secondaryButton} onClick={onClose} data-autofocus>
          Close
        </button>
      }
    >
      <p className={s.participantsFor}>
        <strong>{name}</strong>
      </p>
      <div className={s.placeholder} data-testid="class-panel-placeholder">
        <Icon name={info.icon} size={28} weight={400} />
        <p className={s.placeholderTitle}>{info.title}</p>
        <p className={s.placeholderText}>{info.text} The details will be added later.</p>
      </div>
    </Dialog>
  );
}
