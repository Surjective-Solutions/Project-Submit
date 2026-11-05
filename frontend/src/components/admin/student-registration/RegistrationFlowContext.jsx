'use client';

import { createContext, useContext, useMemo, useState } from 'react';

// Keeps the registration in memory while the admin moves between the three pages. It lives in the
// layout of the student-registration folder, so it survives navigation between the pages and is
// dropped when the admin leaves the section. Nothing here goes to storage or the URL, and the
// password is never kept here at all (it only exists inside the Set Password page).
//
//   pending: { form, sameWhatsapp, photo: { dataUrl, file } | null, studentId }   set by page 1
//   result:  { studentId, summary, photoUrl }                                      set by page 2
const RegistrationFlowContext = createContext(null);

export function RegistrationFlowProvider({ children }) {
  const [pending, setPending] = useState(null);
  const [result, setResult] = useState(null);

  const value = useMemo(
    () => ({
      pending,
      setPending,
      result,
      setResult,
      clear: () => {
        setPending(null);
        setResult(null);
      },
    }),
    [pending, result]
  );

  return <RegistrationFlowContext.Provider value={value}>{children}</RegistrationFlowContext.Provider>;
}

export function useRegistrationFlow() {
  const context = useContext(RegistrationFlowContext);
  if (!context) throw new Error('useRegistrationFlow must be used inside RegistrationFlowProvider.');
  return context;
}
