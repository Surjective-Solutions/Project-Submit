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
  { value: 'registered', label: 'Registered users', hint: 'Students who paid the admission fees for the tutor' },
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

// Only the level tab and the tutor-page filters are remembered between visits.
export const STORAGE_KEY = 'syzygy.classes.v1';

export const HONORIFICS = ['mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'rev', 'eng'];
