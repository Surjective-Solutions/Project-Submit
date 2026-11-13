import Icon from '@/components/admin/Icon';
import s from './sessions.module.css';

// Attendance of one session. The details are still to be defined, so this is a placeholder for now.
export default function ParticipantsTab({ session }) {
  return (
    <div className={s.placeholder} data-testid="participants-placeholder">
      <Icon name="groups" size={28} weight={400} />
      <p className={s.placeholderTitle}>Participants</p>
      <p className={s.placeholderText}>
        Who attended “{session.name}” will be shown here once the attendance details are added.
      </p>
    </div>
  );
}
