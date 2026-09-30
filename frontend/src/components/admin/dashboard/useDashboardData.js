'use client';

import { useEffect, useState } from 'react';
import { getAdminStudentSummary } from '@/lib/api-client';

// All admin dashboard API calls live here so AdminDashboard only binds data.
// Each section loads independently: one failing endpoint doesn't blank the
// rest of the page. Add new dashboard calls as another entry in `loaders`.
const loaders = {
  studentSummary: getAdminStudentSummary,
};

const initialState = Object.fromEntries(
  Object.keys(loaders).map((key) => [key, { data: null, loading: true, error: null }]),
);

export default function useDashboardData() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let cancelled = false;

    Object.entries(loaders).forEach(([key, load]) => {
      load()
        .then((data) => ({ data, loading: false, error: null }))
        .catch((error) => {
          console.error(`[dashboard] failed to load ${key}`, error);
          return { data: null, loading: false, error };
        })
        .then((next) => {
          if (!cancelled) setState((prev) => ({ ...prev, [key]: next }));
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
