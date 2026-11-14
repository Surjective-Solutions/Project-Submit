import {
  BANNER_MAX_MB,
  BANNER_TYPES,
  CLASS_INFO_MAX,
  CLASS_NAME_MAX,
  DEFAULT_SHARES,
  LEVELS,
  PAYMENT_FORMATS,
  PRICE_DIGITS,
  RESOURCE_FILE_MAX_MB,
  RESOURCE_FILE_TYPES,
  RESOURCE_TITLE_MAX,
  RESOURCE_VIDEO_MAX_MB,
  SUBJECTS,
  TRAILER_MAX_MB,
  TRAILER_TYPES,
} from './constants';
import { digitsOnly, shareTotal, toNumber } from './sessionUtils';
import { feeText, payablePrice } from './utils';

// Pure helpers for editing a class and for the resources of a session.

// ── Price ───────────────────────────────────────────────────────────────────

// "per day" / "per month" / "" for one-time, for a label such as "Price per month".
export const paymentPer = (format) => PAYMENT_FORMATS.find((f) => f.value === format)?.per ?? 'per month';

// "LKR 3,500 / month" or "LKR 3,500 one-time"
export const priceText = (amount, format) => feeText(amount, format);

// The price a student pays now: the special price when there is one.
export const effectivePrice = payablePrice;

// ── The edit form ───────────────────────────────────────────────────────────

export const batchValue = (year, level) => `${year}|${level}`;
export const batchLabel = (value) => {
  const [year, level] = String(value).split('|');
  return `${year} ${level}`;
};

// Batches offered: this year and the next four (and the year before) for each level, plus the class's own.
export function batchChoices(currentValue, now = new Date()) {
  const year = now.getFullYear();
  const values = [];
  for (const level of LEVELS) {
    for (let y = year - 1; y <= year + 4; y += 1) values.push(batchValue(y, level));
  }
  if (currentValue && !values.includes(currentValue)) values.push(currentValue);
  return values.sort((a, b) => batchLabel(a).localeCompare(batchLabel(b)));
}

export function subjectChoices(current) {
  const list = [...SUBJECTS];
  if (current && !list.includes(current)) list.push(current);
  return list.sort((a, b) => a.localeCompare(b));
}

// The name a class gets when the admin has not typed one of their own.
export const autoName = (form) => [batchLabel(form.batch), form.subject].filter(Boolean).join(' ');

const emptyMedia = (url = '', name = '') => ({ url, name, file: null, removed: false });

export function classToForm(cls) {
  const shares = cls.shares || DEFAULT_SHARES;
  return {
    name: cls.title || '',
    subject: cls.subject || '',
    batch: batchValue(cls.batchYear, cls.level),
    description: cls.description || '',
    paymentFormat: cls.paymentFormat || 'monthly',
    admissionFee: cls.admissionFee ? String(cls.admissionFee) : '',
    price: cls.price ? String(cls.price) : '',
    specialPrice: cls.specialPrice ? String(cls.specialPrice) : '',
    startDate: cls.startDate || '',
    endDate: cls.endDate || '',
    shares: {
      teacher: String(shares.teacher ?? 0),
      institute: String(shares.institute ?? 0),
      system: String(shares.system ?? 0),
    },
    visibility: cls.visible === false ? 'hide' : 'show',
    day: cls.day || '',
    startTime: cls.startTime || '',
    endTime: cls.endTime || '',
    banner: emptyMedia(cls.bannerUrl || '', cls.bannerName || ''),
    trailer: emptyMedia(cls.trailerUrl || '', cls.trailerName || ''),
  };
}

export const digitsForPrice = (value) => digitsOnly(value, PRICE_DIGITS);
// An amount typed as digits. (toNumber stops at 3 digits, which is right for percentages, not for prices.)
export const toMoney = (value) => Number(digitsForPrice(value)) || 0;

export function validateClass(form) {
  const price = toMoney(form.price);
  const special = toMoney(form.specialPrice);
  const errors = {
    name: !form.name.trim() || form.name.trim().length > CLASS_NAME_MAX,
    subject: !form.subject,
    batch: !form.batch,
    description: form.description.length > CLASS_INFO_MAX,
    price: !(price > 0),
    specialPrice: !!form.specialPrice && !(special > 0 && special < price),
    startDate: !form.startDate,
    endDate: !!form.endDate && !!form.startDate && form.endDate < form.startDate,
    day: !form.day,
    startTime: !form.startTime,
    endTime: !form.endTime || (!!form.startTime && form.endTime <= form.startTime),
    shares: shareTotal(form.shares) !== 100,
  };
  return { errors, count: Object.values(errors).filter(Boolean).length, total: shareTotal(form.shares) };
}

export const CLASS_ERRORS = {
  name: 'Give the class a name.',
  subject: 'Select the subject.',
  batch: 'Select the batch.',
  price: 'Enter the price.',
  specialPrice: 'The special price must be more than 0 and lower than the price.',
  startDate: 'Pick the start date.',
  endDate: 'The end date can’t be before the start date.',
  day: 'Select the class day.',
  startTime: 'Pick the start time.',
  endTime: 'The end time must be after the start time.',
};

// The order the first invalid field is focused in: [error key, element id]
export const CLASS_FIELD_ORDER = [
  ['name', 'class-name'],
  ['subject', 'class-subject'],
  ['batch', 'class-batch'],
  ['description', 'class-info'],
  ['price', 'class-price'],
  ['specialPrice', 'class-special-price'],
  ['startDate', 'class-start-date'],
  ['endDate', 'class-end-date'],
  ['day', 'class-day'],
  ['startTime', 'class-start-time'],
  ['endTime', 'class-end-time'],
  ['shares', 'share-teacher'],
];

// What the API receives. banner / trailer: { file } to upload, { remove: true } to delete, or null to keep.
export function classToPayload(form) {
  const [batchYear, level] = form.batch.split('|');
  const media = (m) => (m.file ? { file: m.file } : m.removed ? { remove: true } : null);
  return {
    title: form.name.trim(),
    subject: form.subject,
    batchYear: Number(batchYear),
    level,
    description: form.description.trim(),
    paymentFormat: form.paymentFormat,
    admissionFee: toMoney(form.admissionFee),
    price: toMoney(form.price),
    specialPrice: toMoney(form.specialPrice) || null,
    startDate: form.startDate,
    endDate: form.endDate || null,
    shares: {
      teacher: toNumber(form.shares.teacher),
      institute: toNumber(form.shares.institute),
      system: toNumber(form.shares.system),
    },
    visible: form.visibility !== 'hide',
    day: form.day,
    startTime: form.startTime,
    endTime: form.endTime,
    banner: media(form.banner),
    trailer: media(form.trailer),
  };
}

// Has anything been changed from how the form started? (files are compared by presence)
export function isDirty(form, initial) {
  const plain = (f) => JSON.stringify({ ...f, banner: undefined, trailer: undefined });
  const media = (m) => `${m.file ? `new:${m.file.name}:${m.file.size}` : m.removed ? 'removed' : m.url}`;
  return plain(form) !== plain(initial) || media(form.banner) !== media(initial.banner) || media(form.trailer) !== media(initial.trailer);
}

// ── Files ───────────────────────────────────────────────────────────────────

export const extensionOf = (name) => {
  const match = /\.([A-Za-z0-9]+)$/.exec(String(name || ''));
  return match ? match[1].toLowerCase() : '';
};

export function formatSize(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

const MB = 1024 * 1024;

function checkFile(file, types, maxMb, noun) {
  if (!file) return '';
  if (!types.includes(extensionOf(file.name))) return `Choose ${noun} in one of these formats: ${types.map((t) => t.toUpperCase()).join(', ')}.`;
  if (file.size > maxMb * MB) return `That file is ${formatSize(file.size)}. The limit is ${maxMb} MB.`;
  return '';
}

export const checkBanner = (file) => checkFile(file, BANNER_TYPES, BANNER_MAX_MB, 'an image');
export const checkTrailer = (file) => checkFile(file, TRAILER_TYPES, TRAILER_MAX_MB, 'a video');

// ── Resources ───────────────────────────────────────────────────────────────

export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'];

export function checkResourceFile(file) {
  if (!file) return '';
  const video = VIDEO_EXTENSIONS.includes(extensionOf(file.name));
  return checkFile(file, RESOURCE_FILE_TYPES, video ? RESOURCE_VIDEO_MAX_MB : RESOURCE_FILE_MAX_MB, 'a file');
}

export function isWebUrl(value) {
  try {
    const url = new URL(String(value).trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// "Answer sheet" etc. for a stored resource type
export const titleFromFileName = (name) => String(name || '').replace(/\.[A-Za-z0-9]+$/, '').replace(/[_]+/g, ' ').trim().slice(0, RESOURCE_TITLE_MAX);

export function validateResource({ title, kind, file, url }) {
  const errors = {
    title: !title.trim() || title.trim().length > RESOURCE_TITLE_MAX,
    file: kind === 'file' && (!file || !!checkResourceFile(file)),
    url: kind === 'link' && !isWebUrl(url),
  };
  return { errors, count: Object.values(errors).filter(Boolean).length };
}
