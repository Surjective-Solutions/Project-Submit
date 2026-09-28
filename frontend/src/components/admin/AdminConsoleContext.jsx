'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/admin/Icon';
import { ADMIN_PROFILE, PENDING_SLIPS } from '@/components/admin/dashboard/dashboard-data';

// Shared state for the admin shell. The slip queue lives here (not in the
// dashboard) because the sidebar, header greeting and KPI cards all show
// its count and must stay in step when a slip is approved or rejected.
const AdminConsoleContext = createContext(null);

const byOldestFirst = (a, b) => b.waitingMinutes - a.waitingMinutes;

export function AdminConsoleProvider({ children }) {
  const [slips, setSlips] = useState(PENDING_SLIPS);

  const resolveSlip = useCallback(
    (id, outcome) => {
      const slip = slips.find((s) => s.id === id);
      if (!slip) return;

      // TODO: call approvePayment / rejectPayment once the slip queue comes
      // from the API. Undo is local-only here; with a real backend the SMS
      // should go out after the toast closes so Undo stays honest.
      setSlips((prev) => prev.filter((s) => s.id !== id));

      const approved = outcome === 'approved';
      toast(
        approved
          ? `${slip.name}'s ${slip.pass} slip approved. Pass activated.`
          : `${slip.name}'s slip rejected. Student notified by SMS.`,
        {
          icon: (
            <Icon
              name={approved ? 'check_circle' : 'cancel'}
              size={20}
              fill
              style={{ color: approved ? '#0B6E96' : '#B3141A' }}
            />
          ),
          action: {
            label: 'Undo',
            onClick: () =>
              setSlips((prev) =>
                prev.some((s) => s.id === slip.id) ? prev : [...prev, slip].sort(byOldestFirst),
              ),
          },
        },
      );
    },
    [slips],
  );

  const value = useMemo(
    () => ({
      profile: ADMIN_PROFILE,
      slips,
      pendingSlipCount: slips.length,
      approveSlip: (id) => resolveSlip(id, 'approved'),
      rejectSlip: (id) => resolveSlip(id, 'rejected'),
    }),
    [slips, resolveSlip],
  );

  return <AdminConsoleContext.Provider value={value}>{children}</AdminConsoleContext.Provider>;
}

export function useAdminConsole() {
  const ctx = useContext(AdminConsoleContext);
  if (!ctx) throw new Error('useAdminConsole must be used within an AdminConsoleProvider.');
  return ctx;
}
