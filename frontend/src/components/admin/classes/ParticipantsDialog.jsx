'use client';

import Dialog from './Dialog';
import ParticipantsTab from './ParticipantsTab';
import styles from './classes.module.css';
import { formatDateTime } from '@/classes/sessionUtils';
import s from './sessions.module.css';

// Attendance of one session, on its own (not part of the edit form). The attendance details are still to be
// defined, so the body is a placeholder for now.
export default function ParticipantsDialog({ session, onClose }) {
  return (
    <Dialog
      title="Participants"
      titleId="participants-title"
      icon="groups"
      size="lg"
      onClose={onClose}
      footer={
        <button type="button" className={styles.secondaryButton} onClick={onClose} data-autofocus>
          Close
        </button>
      }
    >
      <p className={s.participantsFor}>
        <strong>{session.name}</strong>
        <span>{formatDateTime(session.startsAt)}</span>
      </p>
      <ParticipantsTab session={session} />
    </Dialog>
  );
}
