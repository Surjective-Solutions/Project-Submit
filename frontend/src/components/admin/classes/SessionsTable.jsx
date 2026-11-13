import Icon from '@/components/admin/Icon';
import { accessLabel, formatDateParts, isExpired, modeSummary } from '@/classes/sessionUtils';
import styles from './classes.module.css';
import s from './sessions.module.css';

// The sessions of one class as a table: Session name, Start date, Expires, Recording, and the row actions.
// Dates are narrow: the day on one line and the time under it. On narrow screens each row turns into a small
// card with the column names shown beside the values.
function DateTime({ value }) {
  const { date, time } = formatDateParts(value);
  return (
    <>
      <span className={s.dateLine}>{date}</span>{' '}
      <span className={s.timeLine}>{time}</span>
    </>
  );
}

export default function SessionsTable({ sessions, now, onEdit, onParticipants, onDelete }) {
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th scope="col">Session name</th>
            <th scope="col">Start date</th>
            <th scope="col">Expires</th>
            <th scope="col">Recording</th>
            <th scope="col">
              <span className={s.srOnly}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => {
            const expired = isExpired(session, now);
            return (
              <tr key={session.id}>
                <td data-label="Session name" className={s.nameCell}>
                  <button type="button" className={s.nameButton} onClick={() => onEdit(session)}>
                    {session.name}
                  </button>
                  <span className={s.rowSub}>
                    <Icon name={session.mode === 'physical' ? 'location_on' : 'videocam'} size={15} weight={500} />
                    {modeSummary(session)} · {accessLabel(session.access)}
                  </span>
                </td>
                <td data-label="Start date" className={s.dateCell}>
                  <span className={s.dateBlock}>
                    <DateTime value={session.startsAt} />
                  </span>
                </td>
                <td data-label="Expires" className={s.dateCell}>
                  {session.expiresAt ? (
                    <span className={s.dateBlock}>
                      <DateTime value={session.expiresAt} />
                      {expired && <span className={s.expiredTag}>Expired</span>}
                    </span>
                  ) : (
                    <span className={s.muted}>No expiry</span>
                  )}
                </td>
                <td data-label="Recording">
                  {session.recordingCode ? (
                    <span className={s.codeChip}>
                      <Icon name="play_circle" size={16} weight={500} fill={1} />
                      {session.recordingCode}
                    </span>
                  ) : (
                    <span className={s.muted}>Not added</span>
                  )}
                </td>
                <td className={s.actionsCell}>
                  <span className={s.actions}>
                    <button type="button" className={s.rowButton} onClick={() => onEdit(session)} aria-label={`Edit ${session.name}`}>
                      <Icon name="edit" size={19} weight={500} />
                    </button>
                    <button
                      type="button"
                      className={s.rowButton}
                      onClick={() => onParticipants(session)}
                      aria-label={`Participants of ${session.name}`}
                    >
                      <Icon name="groups" size={19} weight={500} />
                    </button>
                    <button
                      type="button"
                      className={`${s.rowButton} ${s.rowButtonDanger}`}
                      onClick={() => onDelete(session)}
                      aria-label={`Delete ${session.name}`}
                    >
                      <Icon name="delete" size={19} weight={500} />
                    </button>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
