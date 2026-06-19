'use client';

import { createContext, useContext, useState } from 'react';
import { MOCK_STUDENT_ENROLLED_CLASSES } from '@/lib/mock-data';

const EnrolledClassesContext = createContext(null);

export function EnrolledClassesProvider({ children }) {
  const [classes, setClasses] = useState(() => [...MOCK_STUDENT_ENROLLED_CLASSES]);

  function addClass(entry) {
    MOCK_STUDENT_ENROLLED_CLASSES.push(entry);
    setClasses((prev) => [...prev, entry]);
  }

  function removeClass(classId) {
    const idx = MOCK_STUDENT_ENROLLED_CLASSES.findIndex((c) => c.id === classId);
    if (idx !== -1) MOCK_STUDENT_ENROLLED_CLASSES.splice(idx, 1);
    setClasses((prev) => prev.filter((c) => c.id !== classId));
  }

  return (
    <EnrolledClassesContext.Provider value={{ classes, addClass, removeClass }}>
      {children}
    </EnrolledClassesContext.Provider>
  );
}

export function useEnrolledClasses() {
  const ctx = useContext(EnrolledClassesContext);
  if (!ctx) throw new Error('useEnrolledClasses must be used within EnrolledClassesProvider');
  return ctx;
}
