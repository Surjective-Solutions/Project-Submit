// Sample data for the admin dashboard. There are no dashboard endpoints yet;
// each export maps 1:1 to a future API call, so swapping these for fetched
// data should not require changes to the components.

export const ADMIN_PROFILE = {
  firstName: 'Nuwan',
  fullName: 'Nuwan Jayawardena',
  initials: 'NJ',
  role: 'Administrator',
};

export const ACADEMIC_YEARS = [2027, 2026, 2025];

export const NOTIFICATION_COUNT = 5;

export const COLLECTION_SUMMARY = {
  month: 'September',
  collected: 18.4, // LKR millions
  target: 21.2,
};

// Oldest first — this is the order the admin should work through them.
export const PENDING_SLIPS = [
  { id: 'SLP-90412', name: 'Kavindi Rathnayake', studentId: 'SYZ-26-03127', pass: 'Physics · Oct', bank: 'BOC', waitingMinutes: 190, amount: 4500 },
  { id: 'SLP-90418', name: 'Mohamed Rizwan', studentId: 'SYZ-26-02291', pass: 'Combined Maths · Oct', bank: 'Commercial Bank', waitingMinutes: 164, amount: 5000 },
  { id: 'SLP-90423', name: 'Tharushi Senanayake', studentId: 'SYZ-26-04410', pass: 'Chemistry · Oct', bank: 'Sampath Bank', waitingMinutes: 142, amount: 4500 },
  { id: 'SLP-90431', name: 'Arjun Thevarajah', studentId: 'SYZ-26-01876', pass: 'Accounting · Oct', bank: "People's Bank", waitingMinutes: 118, amount: 3800 },
  { id: 'SLP-90437', name: 'Sanduni Weerasinghe', studentId: 'SYZ-26-04655', pass: 'O/L Maths · Oct', bank: 'HNB', waitingMinutes: 96, amount: 2500 },
  { id: 'SLP-90440', name: 'Dilshan Gunawardena', studentId: 'SYZ-26-00934', pass: 'Biology · Oct', bank: 'BOC', waitingMinutes: 81, amount: 4500 },
  { id: 'SLP-90446', name: 'Fathima Nuha', studentId: 'SYZ-26-03762', pass: 'Physics · Oct', bank: 'NSB', waitingMinutes: 67, amount: 4500 },
  { id: 'SLP-90452', name: 'Nethmi Kumarasinghe', studentId: 'SYZ-26-02048', pass: 'Economics · Oct', bank: 'Commercial Bank', waitingMinutes: 52, amount: 3800 },
  { id: 'SLP-90457', name: 'Pasindu Madushanka', studentId: 'SYZ-26-04183', pass: 'ICT · Oct', bank: 'Sampath Bank', waitingMinutes: 40, amount: 3500 },
  { id: 'SLP-90461', name: 'Yashodha Perera', studentId: 'SYZ-26-01502', pass: 'Combined Maths · Oct', bank: 'HNB', waitingMinutes: 28, amount: 5000 },
  { id: 'SLP-90466', name: 'Keerthana Rajendran', studentId: 'SYZ-26-04721', pass: 'O/L Science · Oct', bank: "People's Bank", waitingMinutes: 17, amount: 2500 },
  { id: 'SLP-90470', name: 'Ravindu Jayasuriya', studentId: 'SYZ-26-04798', pass: 'Physics · Oct', bank: 'BOC', waitingMinutes: 6, amount: 4500 },
];

// status: 'live' | 'upcoming' | 'ended'
// recording: 'recording' | 'published' | 'processing' | 'scheduled'
// attended is null until the class starts.
export const TODAYS_CLASSES = [
  { id: 'c1', time: '7:00 AM', end: '9:00 AM', title: 'A/L Chemistry Theory', teacher: 'Dr. Ranasinghe', medium: 'Sinhala', status: 'ended', attended: 1102, enrolled: 1260, recording: 'published' },
  { id: 'c2', time: '9:30 AM', end: '11:30 AM', title: 'O/L Maths', teacher: 'Ms. Sivakumar', medium: 'Tamil', status: 'ended', attended: 488, enrolled: 552, recording: 'published' },
  { id: 'c3', time: '2:00 PM', end: '4:00 PM', title: 'A/L Biology Revision', teacher: 'Mrs. Dissanayake', medium: 'Sinhala', status: 'ended', attended: 918, enrolled: 1040, recording: 'processing' },
  { id: 'c4', time: '4:00 PM', end: '6:00 PM', title: 'A/L Economics', teacher: 'Mr. Bandara', medium: 'English', status: 'ended', attended: 402, enrolled: 470, recording: 'processing' },
  { id: 'c5', time: '6:00 PM', end: '8:00 PM', title: 'A/L Physics Paper Class', teacher: 'Mr. Perera', medium: 'Sinhala', status: 'live', attended: 1284, enrolled: 1490, recording: 'recording' },
  { id: 'c6', time: '6:30 PM', end: '8:30 PM', title: 'A/L Accounting', teacher: 'Mr. Fernando', medium: 'English', status: 'live', attended: 856, enrolled: 1058, recording: 'recording' },
  { id: 'c7', time: '8:30 PM', end: '10:00 PM', title: 'A/L Combined Maths', teacher: 'Mr. Wickramasinghe', medium: 'Sinhala', status: 'upcoming', attended: null, enrolled: 1380, recording: 'scheduled' },
  { id: 'c8', time: '8:30 PM', end: '9:30 PM', title: 'O/L Science', teacher: 'Mr. Nadarajah', medium: 'Tamil', status: 'upcoming', attended: null, enrolled: 610, recording: 'scheduled' },
];

// LKR millions. The last month is the current one and carries a target.
export const FEE_COLLECTIONS = [
  { month: 'Apr', label: 'April', value: 15.2 },
  { month: 'May', label: 'May', value: 16.1 },
  { month: 'Jun', label: 'June', value: 16.8 },
  { month: 'Jul', label: 'July', value: 17.6 },
  { month: 'Aug', label: 'August', value: 19.3 },
  { month: 'Sep', label: 'September', value: 18.4, target: 21.2 },
];

export const PAYMENT_METHODS = [
  { key: 'slip', label: 'Bank slip', share: 54, color: '#223385' },
  { key: 'genie', label: 'Genie', share: 21, color: '#08A5E1' },
  { key: 'card', label: 'Card', share: 14, color: '#F27A6C' },
  { key: 'frimi', label: 'FriMi', share: 11, color: '#F3E895' },
];

export const STUDENTS_BY_STREAM = [
  { stream: 'Physical Science', count: 1420 },
  { stream: 'Biological Science', count: 1180 },
  { stream: 'Commerce', count: 860 },
  { stream: 'O/L', count: 552 },
  { stream: 'Technology', count: 410 },
  { stream: 'Arts', count: 390 },
];

// tone: key into the study-pack tint styles in dashboard.module.css
export const STUDY_PACK_STAGES = [
  { key: 'packed', label: 'Packed', note: 'Ready at the warehouse', count: 4120, icon: 'inventory_2', tone: 'grey' },
  { key: 'dispatched', label: 'Dispatched', note: 'With the courier', count: 2480, icon: 'local_shipping', tone: 'cyan' },
  { key: 'delivered', label: 'Delivered', note: 'Confirmed by the courier', count: 1120, icon: 'done_all', tone: 'blue' },
  { key: 'returned', label: 'Returned / wrong address', note: 'Needs an address check', count: 18, icon: 'assignment_return', tone: 'red' },
];
