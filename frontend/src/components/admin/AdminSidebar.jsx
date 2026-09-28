'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/admin/Icon';
import { useAdminConsole } from '@/components/admin/AdminConsoleContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
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

export default function AdminSidebar() {
  const pathname = usePathname();
  const { profile, pendingSlipCount } = useAdminConsole();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  function handleLogout() {
    sessionStorage.clear();
    window.location.href = '/admin/login';
  }

  return (
    <Sidebar
      collapsible="icon"
      innerStyle={{
        background: 'linear-gradient(180deg, #1C2554 0%, #172C4E 55%, #0F3447 100%)',
        padding: collapsed ? '22px 10px 16px' : '22px 14px 16px',
      }}
    >
      <SidebarHeader className="p-0">
        <div className={collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between gap-2'}>
          <Link href="/admin/dashboard" className={styles.brand} aria-label="Syzygy Admin Console — Dashboard">
            <span className={styles.logoTile} aria-hidden="true">
              <img src="/images/online-logo.png" alt="" className={styles.logoImg} />
            </span>
            {!collapsed && (
              <span className={styles.brandText}>
                <span className={styles.brandName}>Syzygy</span>
                <span className={styles.brandSub}>Admin Console</span>
              </span>
            )}
          </Link>
          <SidebarTrigger className="shrink-0 text-[rgba(214,222,240,0.62)] hover:text-white hover:bg-white/10" />
        </div>
        {!collapsed && <div className={styles.sidebarDivider} aria-hidden="true" />}
      </SidebarHeader>

      <SidebarContent className={styles.navScroll}>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className={styles.menuLabel}>Main menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className={styles.navList}>
              {NAV_ITEMS.map(({ label, icon, href, badge }) => {
                const isActive = pathname === href || pathname.startsWith(`${href}/`);
                const count = badge === 'pendingSlips' ? pendingSlipCount : 0;
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={isActive}
                      tooltip={label}
                      className={isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
                    >
                      {collapsed ? (
                        <Icon
                          name={icon}
                          size={18}
                          fill={isActive}
                          style={{ color: isActive ? 'var(--syz-cyan-light)' : 'rgba(214, 222, 240, 0.62)' }}
                        />
                      ) : (
                        <span className={styles.navTile}>
                          <Icon name={icon} size={19} fill={isActive} />
                        </span>
                      )}
                      {!collapsed && <span className={styles.navLabel}>{label}</span>}
                      {!collapsed && count > 0 && (
                        <span className={styles.countChip}>
                          {count}
                          <span className={styles.srOnly}> {count === 1 ? 'slip' : 'slips'} waiting</span>
                        </span>
                      )}
                      {!collapsed && isActive && <span className={styles.activeDot} aria-hidden="true" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-0">
        <div
          className={styles.profile}
          style={collapsed ? { padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 } : undefined}
        >
          <div className={styles.profileRow} style={collapsed ? { justifyContent: 'center' } : undefined}>
            <span
              className={styles.avatar}
              aria-hidden="true"
              style={collapsed ? { width: 32, height: 32, fontSize: 11.5 } : undefined}
            >
              {profile.initials}
            </span>
            {!collapsed && (
              <span className={styles.profileText}>
                <span className={styles.profileName}>{profile.fullName}</span>
                <span className={styles.roleChip}>{profile.role}</span>
              </span>
            )}
          </div>
          <button
            type="button"
            className={styles.logout}
            onClick={handleLogout}
            title="Log out"
            style={collapsed ? { justifyContent: 'center', width: 'auto', padding: '8px 0 0' } : undefined}
          >
            <Icon name="logout" size={18} />
            {!collapsed && <span className={styles.navLabel}>Log out</span>}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}