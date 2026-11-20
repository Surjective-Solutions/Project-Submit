// Which exam level a teacher teaches (A/L or O/L), and which grades belong to which level.
// Used in the teacher account so a teacher is only offered grades of their own level.
// An unknown level, or a grade label that says neither A/L nor O/L, is never filtered out.

export const AL = 'A/L';
export const OL = 'O/L';

// "A/L", "AL", "Advanced Level", "O/L", "Ordinary Level", "A/L, O/L", "Both" ... -> ['A/L'], ['O/L'], ['A/L', 'O/L'], or [].
export function parseExamLevels(raw) {
  const text = String(Array.isArray(raw) ? raw.join(',') : (raw ?? '')).toLowerCase();
  if (!text.trim()) return [];
  const levels = [];
  if (/\ba\s*\/?\s*l\b|advanced/.test(text)) levels.push(AL);
  if (/\bo\s*\/?\s*l\b|ordinary/.test(text)) levels.push(OL);
  if (levels.length === 0 && /\bboth\b|\ball\b/.test(text)) return [AL, OL];
  return levels;
}

// The level a grade label belongs to ("Grade 13 · A/L 2026" -> 'A/L'), or '' when it doesn't say.
export function gradeLevel(label) {
  const text = String(label ?? '');
  if (/\bA\s*\/\s*L\b|\bAL\b|advanced/i.test(text)) return AL;
  if (/\bO\s*\/\s*L\b|\bOL\b|ordinary/i.test(text)) return OL;
  return '';
}

// True when a teacher of `levels` may use this grade. No known level -> everything is allowed.
export function gradeAllowed(label, levels) {
  if (!levels || levels.length === 0) return true;
  const level = gradeLevel(label);
  return level === '' || levels.includes(level);
}
