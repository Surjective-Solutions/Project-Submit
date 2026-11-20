// Small helpers for Class Recordings: formatting, codes, folder trees and search.

export const MAX_BYTES = 10 * 1024 ** 3; // 10 GB
export const VIDEO_EXTENSIONS = ['mp4', 'mov', 'mkv', 'webm'];

// ── Formatting ───────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// '2026-11-12T10:00:00' -> '12 Nov 2026'
export function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// 6720 -> '1h 52m', 3120 -> '52m'
export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

// 6724 -> '1:52:04', 3124 -> '52:04' (the badge on the thumbnail)
export function formatClock(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatBytes(bytes) {
  const n = Math.max(0, Number(bytes) || 0);
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
  if (n >= 1024 ** 2) return `${Math.round(n / 1024 ** 2)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const HONORIFIC = /^(mr|mrs|ms|miss|dr|prof|rev)\.?\s+/i;

// 'Mr. Ruwan Perera' -> 'RP' (the title is skipped)
export function initials(name) {
  const words = String(name ?? '').replace(HONORIFIC, '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

// ── Codes ────────────────────────────────────────────────────────────────────
// 8 characters from A-Z and 2-9 without look-alikes (no I, L, O, 0, 1), shown as REC-XXXX-XXXX.
// The server makes the real ones; this is for the mock.

export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function makeCode(random = Math.random) {
  const chars = Array.from({ length: 8 }, () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]);
  return `REC-${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`;
}

// 'rec-7k4p-q2mx' / '7K4P Q2MX' / '7k4pq2mx' -> '7K4PQ2MX'
export function normaliseCode(input) {
  return String(input ?? '')
    .toUpperCase()
    .replace(/^\s*REC[-\s]?/, '')
    .replace(/[^A-Z0-9]/g, '');
}

export const shareUrlFor = (code) => `https://lms.syzygy.lk/r/${code}`;

// ── Files ────────────────────────────────────────────────────────────────────

export function titleFromFileName(name) {
  return String(name ?? '')
    .replace(/\.[^.]+$/, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Returns an error message, or '' when the file can be uploaded.
export function videoFileError(file) {
  if (!file) return 'Choose a video file to upload.';
  const ext = String(file.name).split('.').pop().toLowerCase();
  const looksLikeVideo = String(file.type).startsWith('video/') || VIDEO_EXTENSIONS.includes(ext);
  if (!looksLikeVideo) return 'Choose a video file (MP4, MOV, MKV or WebM).';
  if (file.size > MAX_BYTES) return 'This file is larger than 10 GB.';
  return '';
}

// Reads the length from the video itself. Resolves to seconds, or null when the browser can't read it.
export function readVideoDuration(file, timeoutMs = 4000) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') {
      resolve(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    let finished = false;
    const done = (value) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      video.removeAttribute('src');
      URL.revokeObjectURL?.(url);
      resolve(value);
    };
    const timer = setTimeout(() => done(null), timeoutMs);
    video.preload = 'metadata';
    video.onloadedmetadata = () => done(Number.isFinite(video.duration) ? Math.round(video.duration) : null);
    video.onerror = () => done(null);
    video.src = url;
  });
}

// ── Folder tree ──────────────────────────────────────────────────────────────
// folders:    [{ id, name, parentId }]  (parentId is null at the tutor's top level)
// recordings: [{ id, title, folderId, code, uploadedAt, ... }]  (folderId is null at the top level)

const byName = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base', numeric: true });

export function buildIndex(folders, recordings) {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const children = new Map(); // parentId (or 'root') -> folders
  for (const folder of folders) {
    const key = folder.parentId ?? 'root';
    if (!children.has(key)) children.set(key, []);
    children.get(key).push(folder);
  }
  for (const list of children.values()) list.sort(byName);

  const directRecordings = new Map();
  for (const rec of recordings) {
    const key = rec.folderId ?? 'root';
    directRecordings.set(key, (directRecordings.get(key) ?? 0) + 1);
  }

  // recordings inside a folder, including everything below it
  const totals = new Map();
  const total = (key) => {
    if (totals.has(key)) return totals.get(key);
    let sum = directRecordings.get(key) ?? 0;
    for (const child of children.get(key) ?? []) sum += total(child.id);
    totals.set(key, sum);
    return sum;
  };

  return {
    byId,
    childrenOf: (id) => children.get(id ?? 'root') ?? [],
    recordingTotal: (id) => total(id ?? 'root'),
  };
}

// The folders from the top level down to this one: [{...}, {...}]
export function pathOf(folderId, byId) {
  const path = [];
  let current = folderId ? byId.get(folderId) : null;
  const seen = new Set();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : null;
  }
  return path;
}

// Ids of the folder itself and every folder below it.
export function subtreeIds(folderId, index) {
  const ids = new Set();
  const walk = (id) => {
    ids.add(id);
    for (const child of index.childrenOf(id)) walk(child.id);
  };
  walk(folderId);
  return ids;
}

// ── Search ───────────────────────────────────────────────────────────────────
// Looks in the open folder and everything below it: recording titles, folder names, and codes
// (with or without "REC-" and dashes).

export function searchLibrary({ folders, recordings, folderId, query }) {
  const text = String(query ?? '').trim().toLowerCase();
  if (!text) return { folders: [], recordings: [] };
  const code = normaliseCode(query);

  const index = buildIndex(folders, recordings);
  const scope = folderId ? subtreeIds(folderId, index) : null; // null = everything

  const inScope = (id) => (scope ? scope.has(id) : true);

  const foundFolders = folders
    .filter((f) => f.id !== folderId && inScope(f.id) && f.name.toLowerCase().includes(text))
    .sort(byName)
    .map((folder) => ({ folder, path: pathOf(folder.parentId, index.byId) }));

  const foundRecordings = recordings
    .filter((rec) => inScope(rec.folderId) && matchesRecording(rec, text, code))
    .sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)))
    .map((rec) => ({ rec, path: pathOf(rec.folderId, index.byId) }));

  return { folders: foundFolders, recordings: foundRecordings };
}

function matchesRecording(rec, text, code) {
  if (rec.title.toLowerCase().includes(text)) return true;
  // very short fragments would match almost every code, so codes need 3+ characters
  return code.length >= 3 && normaliseCode(rec.code).includes(code);
}

// ── Clipboard ────────────────────────────────────────────────────────────────

// Copies text. Resolves to true when it worked.
export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the old way */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
