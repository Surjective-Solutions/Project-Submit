'use client';

import Icon from '@/components/admin/Icon';
import { useAdminConsole } from '@/components/admin/AdminConsoleContext';
import PasswordCard from './PasswordCard';
import ProfileCard from './ProfileCard';
import styles from './account.module.css';

export default function AccountPage() {
  const { profile, profileStatus, refreshProfile, updateProfile } = useAdminConsole();

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.h1}>My Account</h1>
        <p className={styles.subtitle}>Update your details, profile picture and password.</p>
      </header>

      {profileStatus === 'loading' && (
        <div className={styles.layout} aria-busy="true" role="status" aria-label="Loading your account">
          <div className={`${styles.card} ${styles.skeletonCard} ${styles.colMain}`} />
          <div className={`${styles.card} ${styles.skeletonCard} ${styles.colSide}`} />
        </div>
      )}

      {profileStatus === 'error' && (
        <div className={styles.errorBox} role="alert">
          <Icon name="error" size={20} weight={600} fill={1} />
          <span className={styles.errorText}>Couldn&rsquo;t load your account. Check the connection and try again.</span>
          <button type="button" className={styles.neutralButton} onClick={refreshProfile}>
            <Icon name="refresh" size={18} weight={600} />
            Try again
          </button>
        </div>
      )}

      {profileStatus === 'ready' && (
        <div className={styles.layout}>
          <div className={styles.colMain}>
            <ProfileCard profile={profile} onSaved={updateProfile} />
          </div>
          <div className={styles.colSide}>
            <PasswordCard profile={profile} />
          </div>
        </div>
      )}
    </div>
  );
}
