// Mock data for the Syzygy Admin Console Staff page (/admin/staff).
// Shapes are kept API-ready: swap STAFF_DATA for a real fetch later without
// touching the components — they only rely on the field names used here.

const TITLE_PREFIXES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.'];

export function getInitials(fullName) {
  const parts = (fullName || '')
    .split(' ')
    .map((p) => p.trim())
    .filter((p) => p && !TITLE_PREFIXES.includes(p));
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const CATEGORIES = [
  {
    key: 'teachers',
    label: 'Teachers',
    singularLabel: 'TEACHER',
    icon: 'co_present',
    idPrefix: 'TCH',
    searchPlaceholder: 'Search teachers or subjects',
    avatarColors: { bg: '#EEF0F8', color: '#223385' },
    permissions: [
      { key: 'startLiveClasses', label: 'Start live classes' },
      { key: 'uploadRecordings', label: 'Upload recordings' },
      { key: 'publishResults', label: 'Publish results' },
    ],
  },
  {
    key: 'instructors',
    label: 'Instructors',
    singularLabel: 'INSTRUCTOR',
    icon: 'support_agent',
    idPrefix: 'INS',
    searchPlaceholder: 'Search instructors or teachers',
    avatarColors: { bg: '#E4F5FC', color: '#0B4F6E' },
    permissions: [
      { key: 'markPapers', label: 'Mark papers' },
      { key: 'moderateLiveChat', label: 'Moderate live chat' },
      { key: 'editRecordings', label: 'Edit recordings' },
    ],
  },
  {
    key: 'cashiers',
    label: 'Cashiers',
    singularLabel: 'CASHIER',
    icon: 'point_of_sale',
    idPrefix: 'CSH',
    searchPlaceholder: 'Search cashiers or desks',
    avatarColors: { bg: '#FDF9DC', color: '#5C4E00' },
    permissions: [
      { key: 'verifyBankSlips', label: 'Verify bank slips' },
      { key: 'recordCashPayments', label: 'Record cash payments' },
      {
        key: 'issueRefunds',
        label: 'Issue refunds',
        note: 'Needs admin approval over LKR 10,000',
      },
    ],
  },
];

export const STAFF_DATA = {
  teachers: [
    {
      id: 'tch-1', idCode: 'TCH-0101', fullName: 'Mr. Ruwan Perera',
      mobile: '+94 71 234 5601', email: 'ruwan.perera@syzygy.lk', status: 'Active',
      subject: 'Physics', stream: 'A/L', medium: 'Sinhala/English',
      weeklyLoad: '18 hrs/wk', enrolledStudents: 1490, joined: '12 Jan 2021',
      permissions: { startLiveClasses: true, uploadRecordings: true, publishResults: true },
    },
    {
      id: 'tch-2', idCode: 'TCH-0102', fullName: 'Mr. Chaminda Wickramasinghe',
      mobile: '+94 71 234 5602', email: 'chaminda.wickramasinghe@syzygy.lk', status: 'Active',
      subject: 'Combined Maths', stream: 'A/L', medium: 'Sinhala',
      weeklyLoad: '20 hrs/wk', enrolledStudents: 1120, joined: '03 Jun 2020',
      permissions: { startLiveClasses: true, uploadRecordings: true, publishResults: true },
    },
    {
      id: 'tch-3', idCode: 'TCH-0103', fullName: 'Dr. Hasitha Gunawardena',
      mobile: '+94 71 234 5603', email: 'hasitha.gunawardena@syzygy.lk', status: 'Active',
      subject: 'Biology', stream: 'A/L', medium: 'English',
      weeklyLoad: '16 hrs/wk', enrolledStudents: 980, joined: '22 Sep 2022',
      permissions: { startLiveClasses: true, uploadRecordings: true, publishResults: true },
    },
    {
      id: 'tch-4', idCode: 'TCH-0104', fullName: 'Mr. Asela Fernando',
      mobile: '+94 71 234 5604', email: 'asela.fernando@syzygy.lk', status: 'Active',
      subject: 'Accounting', stream: 'A/L', medium: 'Sinhala',
      weeklyLoad: '14 hrs/wk', enrolledStudents: 610, joined: '14 Mar 2023',
      permissions: { startLiveClasses: true, uploadRecordings: true, publishResults: true },
    },
    {
      id: 'tch-5', idCode: 'TCH-0105', fullName: 'Mrs. Dilani Jayasinghe',
      mobile: '+94 71 234 5605', email: 'dilani.jayasinghe@syzygy.lk', status: 'Active',
      subject: 'Chemistry', stream: 'A/L', medium: 'Sinhala/English',
      weeklyLoad: '17 hrs/wk', enrolledStudents: 875, joined: '30 Nov 2021',
      permissions: { startLiveClasses: true, uploadRecordings: true, publishResults: true },
    },
    {
      id: 'tch-6', idCode: 'TCH-0106', fullName: 'Ms. Priya Sivakumar',
      mobile: '+94 71 234 5606', email: 'priya.sivakumar@syzygy.lk', status: 'Active',
      subject: 'Maths', stream: 'O/L', medium: 'Tamil',
      weeklyLoad: '15 hrs/wk', enrolledStudents: 540, joined: '18 Aug 2023',
      permissions: { startLiveClasses: true, uploadRecordings: true, publishResults: true },
    },
    {
      id: 'tch-7', idCode: 'TCH-0107', fullName: 'Mr. Nalin Bandara',
      mobile: '+94 71 234 5607', email: 'nalin.bandara@syzygy.lk', status: 'Active',
      subject: 'SFT', stream: 'O/L', medium: 'Sinhala',
      weeklyLoad: '12 hrs/wk', enrolledStudents: 460, joined: '05 Feb 2024',
      permissions: { startLiveClasses: true, uploadRecordings: true, publishResults: true },
    },
    {
      id: 'tch-8', idCode: 'TCH-0108', fullName: 'Mrs. Fathima Rizvi',
      mobile: '+94 71 234 5608', email: 'fathima.rizvi@syzygy.lk', status: 'Inactive',
      subject: 'Economics', stream: 'A/L', medium: 'English',
      weeklyLoad: '10 hrs/wk', enrolledStudents: 390, joined: '19 Jul 2022',
      permissions: { startLiveClasses: true, uploadRecordings: true, publishResults: true },
    },
  ],
  instructors: [
    {
      id: 'ins-1', idCode: 'INS-0101', fullName: 'Mr. Kasun Weerasinghe',
      mobile: '+94 76 345 6701', email: 'kasun.weerasinghe@syzygy.lk', status: 'Active',
      assists: 'Mr. Ruwan Perera', subject: 'Physics', role: 'Paper marking',
      focus: 'A/L structured questions', hours: 14, joined: '02 Feb 2023',
      permissions: { markPapers: true, moderateLiveChat: true, editRecordings: false },
    },
    {
      id: 'ins-2', idCode: 'INS-0102', fullName: 'Mrs. Nadeesha Kumari',
      mobile: '+94 76 345 6702', email: 'nadeesha.kumari@syzygy.lk', status: 'Active',
      assists: 'Mrs. Dilani Jayasinghe', subject: 'Chemistry', role: 'Paper marking',
      focus: 'MCQ + essay', hours: 13, joined: '11 May 2022',
      permissions: { markPapers: true, moderateLiveChat: true, editRecordings: false },
    },
    {
      id: 'ins-3', idCode: 'INS-0103', fullName: 'Mr. Sampath Kodithuwakku',
      mobile: '+94 76 345 6703', email: 'sampath.kodithuwakku@syzygy.lk', status: 'Active',
      assists: 'Mr. Chaminda Wickramasinghe', subject: 'Combined Maths', role: 'Live Q&A moderator',
      focus: 'Evening sessions', hours: 16, joined: '27 Sep 2021',
      permissions: { markPapers: false, moderateLiveChat: true, editRecordings: false },
    },
    {
      id: 'ins-4', idCode: 'INS-0104', fullName: 'Ms. Ishara Madhavi',
      mobile: '+94 76 345 6704', email: 'ishara.madhavi@syzygy.lk', status: 'Active',
      assists: 'Dr. Hasitha Gunawardena', subject: 'Biology', role: 'Recording editor',
      focus: 'Post-production', hours: 12, joined: '08 Jan 2024',
      permissions: { markPapers: false, moderateLiveChat: false, editRecordings: true },
    },
    {
      id: 'ins-5', idCode: 'INS-0105', fullName: 'Mr. Vinoth Raveendran',
      mobile: '+94 76 345 6705', email: 'vinoth.raveendran@syzygy.lk', status: 'Active',
      assists: 'Ms. Priya Sivakumar', subject: 'Maths', role: 'Tamil medium support',
      focus: 'Doubt-clearing', hours: 11, joined: '21 Mar 2024',
      permissions: { markPapers: true, moderateLiveChat: true, editRecordings: false },
    },
    {
      id: 'ins-6', idCode: 'INS-0106', fullName: 'Ms. Oshadi Perera',
      mobile: '+94 76 345 6706', email: 'oshadi.perera@syzygy.lk', status: 'Inactive',
      assists: 'Mr. Asela Fernando', subject: 'Accounting', role: 'Paper marking',
      focus: '—', hours: 0, joined: '—',
      permissions: { markPapers: true, moderateLiveChat: true, editRecordings: false },
    },
  ],
  cashiers: [
    {
      id: 'csh-1', idCode: 'CSH-0101', fullName: 'Ms. Anusha Dissanayake',
      mobile: '+94 77 456 7801', email: 'anusha.dissanayake@syzygy.lk', status: 'Active',
      desk: 'Online slip desk', location: 'Remote', shift: 'Morning', days: 'Mon–Fri',
      today: 'LKR 184,500', joined: '14 Apr 2022',
      permissions: { verifyBankSlips: true, recordCashPayments: true, issueRefunds: false },
    },
    {
      id: 'csh-2', idCode: 'CSH-0102', fullName: 'Mr. Roshan Silva',
      mobile: '+94 77 456 7802', email: 'roshan.silva@syzygy.lk', status: 'Active',
      desk: 'Online slip desk', location: 'Remote', shift: 'Evening', days: 'Mon–Sat',
      today: 'LKR 96,200', joined: '02 Oct 2023',
      permissions: { verifyBankSlips: true, recordCashPayments: true, issueRefunds: false },
    },
    {
      id: 'csh-3', idCode: 'CSH-0103', fullName: 'Mrs. Chathurika Bandaranayake',
      mobile: '+94 77 456 7803', email: 'chathurika.bandaranayake@syzygy.lk', status: 'Active',
      desk: 'Kandy office counter', location: 'Kandy branch', shift: 'Full day', days: 'Mon–Sat',
      today: 'LKR 142,000', joined: '19 Jun 2021',
      permissions: { verifyBankSlips: true, recordCashPayments: true, issueRefunds: true },
    },
    {
      id: 'csh-4', idCode: 'CSH-0104', fullName: 'Mr. Thiruvarangan Mahendran',
      mobile: '+94 77 456 7804', email: 'thiruvarangan.mahendran@syzygy.lk', status: 'Inactive',
      desk: 'Jaffna office counter', location: 'Jaffna branch', shift: 'Full day', days: 'Mon–Fri',
      today: 'LKR 0', joined: '05 Nov 2020',
      permissions: { verifyBankSlips: false, recordCashPayments: false, issueRefunds: false },
    },
  ],
};