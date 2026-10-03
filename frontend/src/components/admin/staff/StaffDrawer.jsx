'use client';

import Icon from '@/components/admin/Icon';
import StatusChip from './StatusChip';
import { getInitials } from '@/mocks/staff';
import styles from './staff.module.css';

const INFO_FIELDS = {
  teachers: [
    { label: 'Subject', value: (p) => p.subject },
    { label: 'Exam level', value: (p) => p.examLevel },
    { label: 'Medium', value: (p) => p.medium },
    { label: 'Enrolled students', value: (p) => p.enrolledStudents }, 
    { label: 'Username', value: (p) => p.username },
    { label: 'Joined', value: (p) => p.joined },
  ],
  instructors: [
    { label: 'Assists', value: (p) => p.assists },
    { label: 'Joined', value: (p) => p.joined },
    { label: 'NIC', value: (p) => p.nic },
    { label: 'Address', value: (p) => p.address },
  ],
    cashiers: [
    { label: 'Username', value: (p) => p.username },
    { label: 'NIC', value: (p) => p.nic },
    { label: 'Joined', value: (p) => p.joined },
  ],
};

export default function StaffDrawer({
  category,
  person,
  onClose,
  onResetPassword,
  onToggleActive,
  onEditProfile,
}) {
  if (!person) return null;

  const fields = INFO_FIELDS[category.key];
  const isInactive = person.status === 'Inactive';

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} />
      <aside className={styles.drawer} aria-label={`${category.singularLabel} details`}>
        <div className={styles.drawerTopBar}>
          <span className={styles.drawerRoleLabel}>{category.singularLabel}</span>
          <button type="button" className={styles.iconCloseButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.drawerProfile}>
          <span
            className={styles.drawerAvatar}
            style={{ background: category.avatarColors.bg, color: category.avatarColors.color }}
          >
            {getInitials(person.fullName)}
          </span>
          <span className={styles.drawerName}>{person.fullName}</span>
          <div className={styles.drawerChipRow}>
            <span className={styles.idChip}>{person.idCode}</span>
            <StatusChip status={person.status} />
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Mobile</span>
            <span className={styles.infoValue}>{person.mobile}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{person.email}</span>
          </div>
          {fields.map((f) => (
            <div className={styles.infoItem} key={f.label}>
              <span className={styles.infoLabel}>{f.label}</span>
              <span className={styles.infoValue}>{f.value(person)}</span>
            </div>
          ))}
        </div>

        <div className={styles.actionsGrid}>
          <button type="button" className={styles.outlineActionButton} onClick={() => onEditProfile(person)}>
            Edit profile
          </button>
          <button type="button" className={styles.neutralActionButton} onClick={() => onResetPassword(person)}>
            Reset password
          </button>
          <button
            type="button"
            className={isInactive ? styles.reactivateButton : styles.deactivateButton}
            onClick={() => onToggleActive(person)}
          >
            {isInactive ? 'Activate account' : 'Deactivate account'}
          </button>
        </div>
      </aside>
    </>
  );
}