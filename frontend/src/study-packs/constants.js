// Fixed lists and limits for the Study Packs page.

export const GRADES = [
  'Grade 13 · A/L 2026',
  'Grade 12 · A/L 2027',
  'Grade 11 · O/L 2026',
  'Grade 10 · O/L 2027',
];

export const SUBJECTS = [
  'Physics',
  'Combined Maths',
  'Chemistry',
  'Biology',
  'Accounting',
  'Economics',
  'Business Studies',
  'SFT',
  'ICT',
  'Mathematics (O/L)',
  'Science (O/L)',
];

export const VALIDITY_OPTIONS = [
  { value: '1m', label: '1 month' },
  { value: '3m', label: '3 months' },
  { value: '6m', label: '6 months' },
  { value: 'exam', label: 'Until exam day' },
  { value: 'custom', label: 'Custom' },
];

export const DEFAULT_SHARES = { teacher: 70, institute: 25, system: 5 };

// Order matters: it is the order of the inputs and of the stacked bar.
export const SHARE_PARTS = [
  { key: 'teacher', label: 'Teacher', color: '#223385' },
  { key: 'institute', label: 'Institute', color: '#08A5E1' },
  { key: 'system', label: 'System', color: '#E8D24A' },
];

export const LIMITS = {
  name: 80,
  description: 240,
  priceDigits: 6,
  customDaysDigits: 3,
  shareDigits: 3,
  coverMaxBytes: 2 * 1024 * 1024,
};

export const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
];
