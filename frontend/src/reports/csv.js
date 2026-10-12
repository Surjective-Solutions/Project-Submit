export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 'Mr. Ruwan Perera' -> 'ruwan-perera'
export function teacherSlug(teacher) {
  return slugify(teacher.name.replace(/^(mr|mrs|ms|dr|miss)\.?\s+/i, ''));
}

// e.g. class-enrollments_ruwan-perera_sep-2026.csv
export function reportFileName(type, teacher, period, ext) {
  const teacherPart = teacher.id === 'all' ? 'all-teachers' : teacherSlug(teacher);
  return `${type.slug}_${teacherPart}_${period.slug}.${ext}`;
}

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Header row + one line per row. Uses raw values (not the display formatting).
export function buildCsv(columns, rows) {
  const lines = [columns.map((c) => escapeCell(c.label)).join(',')];
  for (const row of rows) {
    lines.push(columns.map((c) => escapeCell(row[c.key])).join(','));
  }
  return lines.join('\r\n');
}

// The BOM makes Excel read the file as UTF-8 (class names contain an em dash).
export function downloadCsv(filename, csvText) {
  const blob = new Blob(['﻿', csvText], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
