'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { BookOpen, CalendarCheck, LayoutDashboard, ClipboardList, GraduationCap, Users, BarChart2, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTokenPayload } from '@/lib/auth';
import { getTutorById, logoutSession } from '@/lib/api-client';
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
  useSidebar,
} from '@/components/ui/sidebar';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    section: 'dashboard',
    icon: LayoutDashboard,
    accent: '#F9A8D4',
    activeBg: 'rgba(249,168,212,0.14)',
  },
  {
    label: 'Classes',
    section: 'classes',
    icon: BookOpen,
    accent: '#B8FF8F',
    activeBg: 'rgba(184,255,143,0.13)',
  },
  {
    label: 'Students',
    section: 'students',
    icon: GraduationCap,
    accent: '#9CEEF9',
    activeBg: 'rgba(156,238,249,0.14)',
  },
  {
    label: 'Attendance',
    section: 'attendance',
    icon: CalendarCheck,
    accent: '#C4B5FD',
    activeBg: 'rgba(196,181,253,0.14)',
  },
  {
    label: 'Exams',
    section: 'exams',
    icon: ClipboardList,
    accent: '#FFB86B',
    activeBg: 'rgba(255,184,107,0.13)',
  },
  {
    label: 'Instructors',
    section: 'instructors',
    icon: Users,
    accent: '#34A0C5',
    activeBg: 'rgba(52,160,197,0.15)',
  },
  {
    label: 'Statistics',
    section: 'statistics',
    icon: BarChart2,
    accent: '#E9D848',
    activeBg: 'rgba(233,216,72,0.13)',
  },
  {
    label: 'My Account',
    section: 'account',
    icon: User,
    accent: '#34A0C5',
    activeBg: 'rgba(52,160,197,0.15)',
  },
];

export default function TeacherSidebar() {
  const searchParams = useSearchParams();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const pathname = usePathname();

  // The exam pages (a class's papers, its submissions, grading) live under /teacher/dashboard/exams,
  // so they keep "Exams" highlighted. Everything else is picked with ?section=.
  const activeSection = pathname.startsWith('/teacher/dashboard/exams')
    ? 'exams'
    : pathname.startsWith('/teacher/dashboard/classes')
      ? 'classes'
      : searchParams.get('section') ?? 'dashboard';
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    loadTeacher();
  }, []);

  async function loadTeacher() {
    try {
      const payload = getTokenPayload();
      const userSeq = payload?.userSeq;
      if (!userSeq) return;
      const data = await getTutorById(userSeq);
      setTeacher(data);
    } catch {
      console.error('Failed to load teacher');
    }
  }

  const initials = teacher?.displayName?.[0]?.toUpperCase() || '?';
  const fullName = teacher?.displayName ?? '';

  return (
    <Sidebar
      collapsible="icon"
      innerStyle={{
        background: 'linear-gradient(180deg, #1C2554 0%, #172C4E 55%, #0F3447 100%)',
      }}
    >
      {/* ── Brand ───────────────────────────────────────────────────── */}
      <SidebarHeader className={collapsed ? 'px-0 py-4' : 'px-4 pt-5 pb-2'}>
        <div className="flex justify-center">
          {collapsed ? (
            <img src="/images/teacher-sidebar-logo-icon.png" alt="Syzygy" className="h-8 w-8 object-contain" />
          ) : (
            <img src="/images/teacher-sidebar-logo.png" alt="Syzygy" className="w-full h-auto max-w-[130px]" />
          )}
        </div>

        {!collapsed && (
          <p
            className="mt-1 text-center text-sm font-semibold tracking-wide"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            Teacher Portal
          </p>
        )}

        {!collapsed && (
          <div
            className="mt-4 h-px rounded-full"
            style={{
              background:
                'linear-gradient(90deg, rgba(184,255,143,0.4) 0%, rgba(52,160,197,0.4) 50%, rgba(255,255,255,0.05) 100%)',
            }}
          />
        )}
      </SidebarHeader>

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <SidebarContent className="px-2 pt-0">
        <SidebarGroup className="pt-1">
          {!collapsed && (
            <SidebarGroupLabel
              className="h-6 text-[10px] font-semibold uppercase tracking-widest px-2 mb-1"
              style={{ color: 'rgba(255,255,255,0.28)' }}
            >
              Main Menu
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {NAV_ITEMS.map(({ label, section, icon: Icon, accent, activeBg }) => {
                const href = `/teacher/dashboard?section=${section}`;
                const isActive = activeSection === section;
                return (
                  <SidebarMenuItem key={section}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={isActive}
                      tooltip={label}
                      className={
                        collapsed
                          ? 'rounded-xl justify-center'
                          : 'h-10 rounded-xl transition-all duration-150'
                      }
                      style={
                        isActive
                          ? { background: activeBg, border: `1px solid ${accent}22` }
                          : { border: '1px solid transparent' }
                      }
                    >
                      {collapsed ? (
                        <Icon style={{ color: isActive ? accent : 'rgba(255,255,255,0.55)' }} />
                      ) : (
                        <>
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                            style={{ background: isActive ? `${accent}22` : 'rgba(255,255,255,0.07)' }}
                          >
                            <Icon
                              className="h-[15px] w-[15px]"
                              style={{ color: isActive ? accent : 'rgba(255,255,255,0.45)' }}
                            />
                          </div>
                          <span
                            className="text-[13px] font-medium flex-1 leading-none"
                            style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.62)' }}
                          >
                            {label}
                          </span>
                          {isActive && (
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: accent }}
                            />
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <SidebarFooter className="px-3 pb-4 pt-2">
        {!collapsed && (
          <div
            className="mb-3 h-px rounded-full"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)',
            }}
          />
        )}

        {collapsed ? (
          <div className="flex justify-center mb-2 py-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #3940A0 0%, #B8FF8F 100%)', color: '#0e1a2a' }}
              aria-hidden="true"
            >
              {initials}
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl mb-1"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #3940A0 0%, #B8FF8F 100%)', color: '#0e1a2a' }}
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-none mb-1">{fullName}</p>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-tight"
                style={{
                  background: 'rgba(57,64,160,0.3)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(57,64,160,0.4)',
                }}
              >
                Teacher
              </span>
            </div>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="h-8 rounded-lg text-[13px] mt-0.5 transition-colors"
              style={{ color: 'rgba(255,255,255,0.38)' }}
              onClick={async () => {
                await logoutSession('tutor');
                window.location.href = '/teacher/login';
              }}
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
