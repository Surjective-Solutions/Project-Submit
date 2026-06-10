'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Users, BarChart2, LogOut } from 'lucide-react';
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
    label: 'Classes',
    section: 'classes',
    icon: BookOpen,
    accent: '#B8FF8F',
    activeBg: 'rgba(184,255,143,0.13)',
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
];

export default function TeacherSidebar() {
  const searchParams = useSearchParams();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const activeSection = searchParams.get('section') ?? 'classes';

  return (
    <Sidebar
      collapsible="icon"
      innerStyle={{
        background: 'linear-gradient(165deg, #1e1b4b 0%, #1a2e50 30%, #0e3540 60%, #053a34 100%)',
      }}
    >
      {/* ── Brand ───────────────────────────────────────────────────── */}
      <SidebarHeader className={collapsed ? 'px-0 py-4' : 'px-4 py-5'}>
        <div className={collapsed ? 'flex justify-center' : 'flex items-center gap-3'}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #B8FF8F 0%, #34A0C5 100%)',
              boxShadow: '0 3px 10px rgba(52,160,197,0.5)',
            }}
          >
            <span className="text-xs font-black tracking-tight" style={{ color: '#0e1a2a' }}>
              SX
            </span>
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p
                className="text-sm font-bold leading-none tracking-tight"
                style={{
                  background: 'linear-gradient(90deg, #ffffff 0%, #B8FF8F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                SubmitX
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Teacher Console
              </p>
            </div>
          )}
        </div>

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
      <SidebarContent className="px-2 pt-1">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel
              className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2"
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
              T
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
              T
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-none mb-1">Teacher</p>
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
              onClick={() => {}}
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
