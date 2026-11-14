// Constants for the admin Classes section.

export const CLASSES_ROUTE = '/admin/classes';

export const LEVELS = ['A/L', 'O/L'];

// Class types in the order they are listed inside a batch, with the colours used for the chip and dot.
export const CLASS_TYPES = ['Theory', 'Paper', 'Revision', 'Package'];
// A package bundles two or more of the tutor's classes of one batch at a lower combined price.
export const PACKAGE = 'Package';
// The filter buttons say "Packages"; the chip on a card says "Package".
export const TYPE_LABEL = { Theory: 'Theory', Paper: 'Paper', Revision: 'Revision', Package: 'Packages' };
export const TYPE_META = {
  Theory: { color: '#223385', tint: '#eef0f8' },
  Paper: { color: '#b3141a', tint: '#fdecec' },
  Revision: { color: '#6b5700', tint: '#fdf9dc' },
  Package: { color: '#0b4f6e', tint: '#e4f5fc' },
};

// Level tag colours (A/L navy, O/L gold).
export const LEVEL_META = {
  'A/L': { color: '#223385', tint: '#eef0f8' },
  'O/L': { color: '#6b5700', tint: '#fdf9dc' },
};

// Full names for the level codes, used wherever the short form should not be shown.
export const LEVEL_LABEL = { 'A/L': 'Advanced Level', 'O/L': 'Ordinary Level' };

export const ALL = 'all';

// ── Sessions inside a class ─────────────────────────────────────────────────

export const SESSION_ACCESS = [
  { value: 'all', label: 'All', hint: 'Anyone can open this session' },
  { value: 'registered', label: 'Registered users', hint: 'Students with an account' },
  { value: 'paid', label: 'Paid users', hint: 'Students who have paid for this class' },
];

export const SESSION_MODES = [
  { value: 'online', label: 'Online', icon: 'videocam', hint: 'Held live online' },
  { value: 'physical', label: 'Physical', icon: 'location_on', hint: 'Held at a hall' },
];

// How a session's income is split, in percent. The same defaults as study packs.
export const DEFAULT_SHARES = { teacher: 70, institute: 25, system: 5 };
export const SHARE_META = [
  { key: 'teacher', label: 'Teacher', color: '#223385' },
  { key: 'institute', label: 'Institute', color: '#08a5e1' },
  { key: 'system', label: 'System', color: '#e8d24a' },
];

export const SESSION_NAME_MAX = 90;

// ── Editing a class ─────────────────────────────────────────────────────────

export const PAYMENT_FORMATS = [
  { value: 'daily', label: 'Daily', hint: 'Students pay for each day they attend', unit: '/ day', per: 'per day' },
  { value: 'monthly', label: 'Monthly', hint: 'Students pay every month', unit: '/ month', per: 'per month' },
  { value: 'one-time', label: 'One-time', hint: 'Students pay once for the whole class', unit: 'one-time', per: '' },
];

export const VISIBILITY = [
  { value: 'show', label: 'Show', icon: 'visibility', hint: 'Students can see this class' },
  { value: 'hide', label: 'Hide', icon: 'visibility_off', hint: 'Only admins can see this class' },
];

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Subjects offered when editing a class. A class's current subject is always offered too.
export const SUBJECTS = [
  'Accounting',
  'Agricultural Science',
  'Biology',
  'Business Studies',
  'Chemistry',
  'Combined Mathematics',
  'Commerce',
  'Economics',
  'Engineering Technology',
  'English',
  'Geography',
  'History',
  'ICT',
  'Logic',
  'Mathematics',
  'Physics',
  'Political Science',
  'Science',
  'Science for Technology',
  'Sinhala',
  'Tamil',
];

export const CLASS_NAME_MAX = 90;
export const CLASS_INFO_MAX = 600;
export const PRICE_DIGITS = 7;

// Banner (shown to students) and trailer are optional files.
export const BANNER_MAX_MB = 5;
export const TRAILER_MAX_MB = 200;
export const BANNER_TYPES = ['png', 'jpg', 'jpeg', 'webp'];
export const TRAILER_TYPES = ['mp4', 'webm', 'mov'];

// ── Session resources ───────────────────────────────────────────────────────

export const RESOURCE_TYPES = [
  { value: 'video', label: 'Video', icon: 'videocam' },
  { value: 'paper', label: 'Paper', icon: 'description' },
  { value: 'answers', label: 'Answer sheet', icon: 'task' },
  { value: 'notes', label: 'Notes', icon: 'sticky_note_2' },
  { value: 'other', label: 'Other', icon: 'attach_file' },
];
export const RESOURCE_TITLE_MAX = 90;
export const RESOURCE_FILE_TYPES = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'mp4', 'webm', 'mov'];
export const RESOURCE_VIDEO_MAX_MB = 200;
export const RESOURCE_FILE_MAX_MB = 25;

// ── Students of a class ─────────────────────────────────────────────────────

// The filter buttons above the list. "Paid" is paid for this month.
export const STUDENT_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'free', label: 'Free' },
];
// Status of an enrolled student: paid this month, a free enrollment, or enrolled but not paid this month.
export const STUDENT_STATUS = {
  paid: { label: 'Paid', color: '#0b6b47', tint: '#e6f6ee' },
  free: { label: 'Free', color: '#0b4f6e', tint: '#e4f5fc' },
  unpaid: { label: 'Not paid', color: '#6b5700', tint: '#fdf9dc' },
};
export const STUDENT_PAGE = 25;

// ── Participants of a session ───────────────────────────────────────────────
// A student who attended a session did so online or physically (at the hall). The dropdown above the list narrows
// it to one method.
export const PARTICIPANT_METHODS = {
  online: { label: 'Online', icon: 'videocam', color: '#0b4f6e', tint: '#e4f5fc' },
  physical: { label: 'Physical', icon: 'location_on', color: '#0b6b47', tint: '#e6f6ee' },
};
export const PARTICIPANT_FILTERS = [
  { value: 'all', label: 'All methods' },
  { value: 'online', label: 'Online' },
  { value: 'physical', label: 'Physical' },
];
export const PARTICIPANT_PAGE = 25;

// ── Notices ─────────────────────────────────────────────────────────────────
// A notice is shown in the notification centre of the students it is sent to; the category picks its icon.

export const NOTICE_CATEGORIES = [
  { value: 'update', label: 'Class update', icon: 'campaign' },
  { value: 'schedule', label: 'Schedule change', icon: 'event_repeat' },
  { value: 'cancelled', label: 'Class cancelled', icon: 'event_busy' },
  { value: 'material', label: 'New material', icon: 'folder_open' },
  { value: 'exam', label: 'Exam or paper', icon: 'quiz' },
  { value: 'payment', label: 'Payment reminder', icon: 'payments' },
];

// Who receives it. `key` is the matching enrollment number on the class.
export const NOTICE_AUDIENCES = [
  { value: 'all', label: 'All enrolled students', key: 'total' },
  { value: 'paid', label: 'Paid for this month', key: 'paidThisMonth' },
  { value: 'free', label: 'Free enrollments', key: 'free' },
];

export const NOTICE_TITLE_MAX = 90;
export const NOTICE_BODY_MAX = 1000;

// Only the level tab and the tutor-page filters are remembered between visits.
export const STORAGE_KEY = 'syzygy.classes.v1';

export const HONORIFICS = ['mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'rev', 'eng'];
