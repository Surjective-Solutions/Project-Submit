// Small inline icons (no icon package needed). All are decorative: the text next to them carries the meaning.
const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' };

export const PlusIcon = (props) => (
  <svg {...base} {...props}><path d="M12 5v14M5 12h14" /></svg>
);
export const CheckIcon = (props) => (
  <svg {...base} {...props}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const CloseIcon = (props) => (
  <svg {...base} {...props}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const AlertIcon = (props) => (
  <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></svg>
);
export const LockIcon = (props) => (
  <svg {...base} {...props}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const UserCheckIcon = (props) => (
  <svg {...base} {...props}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5 1.5 0 2.8.4 3.9 1.1" /><path d="m15.5 17.5 2 2 4-4.5" /></svg>
);
export const SpinnerIcon = (props) => (
  <svg {...base} {...props}><path d="M12 3a9 9 0 1 0 9 9" /></svg>
);
