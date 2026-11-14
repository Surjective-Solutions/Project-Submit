import { NOTICE_AUDIENCES, NOTICE_BODY_MAX, NOTICE_CATEGORIES, NOTICE_TITLE_MAX } from './constants';

// Pure helpers for class notices.

export const categoryInfo = (value) => NOTICE_CATEGORIES.find((c) => c.value === value) || NOTICE_CATEGORIES[0];
export const audienceInfo = (value) => NOTICE_AUDIENCES.find((a) => a.value === value) || NOTICE_AUDIENCES[0];

// How many students a notice goes to, from the class's enrollment numbers.
export function audienceCount(enrollments, audience) {
  const key = audienceInfo(audience).key;
  return Number(enrollments?.[key]) || 0;
}

export const emptyNoticeForm = () => ({ category: 'update', audience: 'all', title: '', body: '' });

export const noticeToForm = (notice) => ({
  category: notice.category || 'update',
  audience: notice.audience || 'all',
  title: notice.title || '',
  body: notice.body || '',
});

export function validateNotice(form) {
  const title = form.title.trim();
  const body = form.body.trim();
  const errors = {
    title: !title || title.length > NOTICE_TITLE_MAX,
    body: !body || body.length > NOTICE_BODY_MAX,
  };
  return { errors, count: Object.values(errors).filter(Boolean).length };
}

export const NOTICE_ERRORS = {
  title: 'Give the notice a title.',
  body: 'Write the message students should read.',
};

export const noticeToPayload = (form) => ({
  category: form.category,
  audience: form.audience,
  title: form.title.trim(),
  body: form.body.trim(),
});

export const noticeIsDirty = (form, initial) => JSON.stringify(form) !== JSON.stringify(initial);

// Newest first.
export const sortNotices = (notices) =>
  [...notices].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)) || String(b.id).localeCompare(String(a.id)));
