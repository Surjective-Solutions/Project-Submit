'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/admin/Icon';
import { useAdminConsole } from '@/components/admin/AdminConsoleContext';
import styles from './admin-console.module.css';

// `badge: 'pendingSlips'` shows the live count of bank slips waiting.
const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'space_dashboard', href: '/admin/dashboard' },
  { label: 'Staff', icon: 'badge', href: '/admin/staff' },
  { label: 'Students', icon: 'school', href: '/admin/students' },
  { label: 'Reports', icon: 'monitoring', href: '/admin/reports' },
  { label: 'Payments', icon: 'payments', href: '/admin/payments', badge: 'pendingSlips' },
  { label: 'User Registration', icon: 'person_add', href: '/admin/user-registration' },
  { label: 'Study Packs', icon: 'inventory_2', href: '/admin/study-packs' },
  { label: 'Class Recordings', icon: 'video_library', href: '/admin/class-recordings' },
  { label: 'Attendance', icon: 'how_to_reg', href: '/admin/attendance' },
];

const LOGO_DOTS = ['#E5242B', '#08A5E1', '#F6DF33', '#223385'];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { profile, pendingSlipCount } = useAdminConsole();

  function handleLogout() {
    sessionStorage.clear();
    window.location.href = '/admin/login';
  }

  return (
    <aside className={styles.sidebar} aria-label="Admin navigation">
      <Link href="/admin/dashboard" className={styles.brand} aria-label="Syzygy Admin Console — Dashboard">
        <span className={styles.logoTile} aria-hidden="true">
          {LOGO_DOTS.map((color) => (
            <span key={color} className={styles.logoDot} style={{ background: color }} />
          ))}
        </span>
        <span className={styles.brandText}>
          <span className={styles.brandName}>Syzygy</span>
          <span className={styles.brandSub}>Admin Console</span>
        </span>
      </Link>

      <div className={styles.sidebarDivider} aria-hidden="true" />

      <div className={styles.navScroll}>
        <nav aria-labelledby="admin-main-menu">
          <p id="admin-main-menu" className={styles.menuLabel}>
            Main menu
          </p>
          <ul className={styles.navList}>
            {NAV_ITEMS.map(({ label, icon, href, badge }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              const count = badge === 'pendingSlips' ? pendingSlipCount : 0;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    title={label}
                    aria-current={isActive ? 'page' : undefined}
                    className={isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
                  >
                    <span className={styles.navTile}>
                      <Icon name={icon} size={19} fill={isActive} />
                    </span>
                    <span className={styles.navLabel}>{label}</span>
                    {count > 0 && (
                      <span className={styles.countChip}>
                        {count}
                        <span className={styles.srOnly}> {count === 1 ? 'slip' : 'slips'} waiting</span>
                      </span>
                    )}
                    {isActive && <span className={styles.activeDot} aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className={styles.profileSpacer} />

      <div className={styles.profile}>
        <div className={styles.profileRow}>
          <span className={styles.avatar} aria-hidden="true">
            {profile.initials}
          </span>
          <span className={styles.profileText}>
            <span className={styles.profileName}>{profile.fullName}</span>
            <span className={styles.roleChip}>{profile.role}</span>
          </span>
        </div>
        <button type="button" className={styles.logout} onClick={handleLogout} title="Log out">
          <Icon name="logout" size={18} />
          <span className={styles.navLabel}>Log out</span>
        </button>
      </div>
    </aside>
  );
}
