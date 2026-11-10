// Attendance page: shared constants.

export const STATUS_KEYS = ['present', 'late', 'absent']; // mildest to worst

export const STATUS_META = {
  present: { label: 'Present', icon: 'check_circle' },
  late: { label: 'Late', icon: 'schedule' },
  absent: { label: 'Absent', icon: 'cancel' },
};

// Scanned in at or before this many minutes after the start time = Present. Later = Late.
export const ON_TIME_MINUTES = 10;

export const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// The record starts in June when the student has no enrolment start date.
export const FALLBACK_SINCE_MONTH = 6;

// Remembered between visits: the last student ID, tutor, class date and month (nothing else).
export const STORAGE_KEY = 'syzygy.attendance.v1';
