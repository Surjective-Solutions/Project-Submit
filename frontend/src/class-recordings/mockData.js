// Sample data for Class Recordings until the backend exists. It is built from the same recordings the Study Packs
// mock uses, so the codes match: a code seen here can be typed into a study pack.
//
// Tutor     { id, name, photoUrl, subject, level: 'A/L' | 'O/L', mediums: [] }
// Folder    { id, tutorId, name, parentId }                      parentId null = the tutor's top level
// Recording { id, tutorId, folderId, title, durationSec, sizeBytes, uploadedAt, code, shareUrl }

import { SEED_TEACHERS } from '@/study-packs/mockData';
import { RECORDINGS } from '@/study-packs/mockRecordings';
import { shareUrlFor } from './utils';

const MB = 1024 ** 2;

function monthName(dateKey) {
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [year, month] = dateKey.split('-').map(Number);
  return `${names[month - 1]} ${year}`;
}

export function buildSeed() {
  const tutors = SEED_TEACHERS.map((teacher) => {
    const own = RECORDINGS.filter((r) => String(r.teacherId) === String(teacher.id));
    const mediums = [...new Set(own.map((r) => r.medium))];
    const isOl = own.some((r) => r.grade.includes('O/L'));
    return {
      id: String(teacher.id),
      name: teacher.name,
      photoUrl: null,
      subject: teacher.subject,
      level: isOl ? 'O/L' : 'A/L',
      mediums: mediums.length ? mediums : ['English'],
    };
  });

  const folders = [];
  const recordings = [];

  for (const tutor of tutors) {
    const own = RECORDINGS.filter((r) => String(r.teacherId) === tutor.id).sort((a, b) =>
      a.classDate.localeCompare(b.classDate)
    );
    const termId = `f-${tutor.id}-term`;
    folders.push({ id: termId, tutorId: tutor.id, name: 'Term 2 · 2026', parentId: null });

    const monthFolders = new Map();
    own.forEach((r, index) => {
      const isLatest = index === own.length - 1;
      let folderId = null; // the newest recording stays at the top level, so both places have something in them
      if (!isLatest) {
        const month = r.classDate.slice(0, 7);
        if (!monthFolders.has(month)) {
          const id = `f-${tutor.id}-${month}`;
          monthFolders.set(month, id);
          folders.push({ id, tutorId: tutor.id, name: monthName(month), parentId: termId });
        }
        folderId = monthFolders.get(month);
      }
      recordings.push({
        id: `r-${r.code}`,
        tutorId: tutor.id,
        folderId,
        title: r.title,
        durationSec: r.durationMins * 60,
        sizeBytes: Math.round(r.durationMins * 14.2 * MB),
        uploadedAt: `${r.classDate}T10:00:00`,
        code: r.code,
        shareUrl: shareUrlFor(r.code),
      });
    });
  }

  return { tutors, folders, recordings };
}
