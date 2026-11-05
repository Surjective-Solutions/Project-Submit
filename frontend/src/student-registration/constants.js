// Static options and limits for the student registration form.

export const GRADES = [
  { value: '10', label: 'Grade 10' },
  { value: '11', label: 'Grade 11' },
  { value: '12', label: 'Grade 12' },
  { value: '13', label: 'Grade 13' },
];

export const STREAMS = [
  { value: 'Physical Science', label: 'Physical Science' },
  { value: 'Biological Science', label: 'Biological Science' },
  { value: 'Commerce', label: 'Commerce' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Arts', label: 'Arts' },
];

export const MEDIUMS = [
  { value: 'Sinhala', label: 'Sinhala' },
  { value: 'English', label: 'English' },
  { value: 'Tamil', label: 'Tamil' },
];

const DISTRICT_NAMES = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota',
  'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
  'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
  'Trincomalee', 'Vavuniya',
];
export const DISTRICTS = [...DISTRICT_NAMES]
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({ value: name, label: name }));

export const GENDERS = ['Female', 'Male'];

export const AGE_MIN = 10;
export const AGE_MAX = 30;
export const ADDRESS_MIN = 8;

export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Required fields, in the order they appear on the page (used for progress and for focusing the first error).
export const STUDENT_FIELDS = ['firstName', 'lastName', 'contactNumber', 'dateOfBirth', 'gender'];
export const GUARDIAN_FIELDS = ['guardianName', 'guardianContact'];
export const DELIVERY_FIELDS = ['address', 'city', 'district']; // the postal code is optional
// Order of the fields on the page (used to focus the first error after a failed submit).
export const FIELD_ORDER = [
  ...STUDENT_FIELDS,
  ...GUARDIAN_FIELDS,
  'address',
  'city',
  'postalCode',
  'district',
  'email',
  'school',
  'nic',
  'whatsappNumber',
  'grade',
  'stream',
  'medium',
  'examYear'
];

export const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  contactNumber: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  city: '',
  postalCode: '',
  guardianName: '',
  guardianContact: '',
  email: '',
  nic: '',
  whatsappNumber: '',
  school: '',
  grade: '',
  stream: '',
  medium: '',
  examYear: '',
  district: '',
};
