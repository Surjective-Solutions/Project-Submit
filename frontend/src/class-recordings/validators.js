// Rules for folder and recording names, shared by the screens and the (mock) API.
// The server must repeat them.

export const NAME_MAX = 80;
export const TITLE_MAX = 120;

// siblings: the folders that share the new parent. selfId is left out of the duplicate check (renaming a folder to its own name).
// Returns an error message, or '' when the name is fine.
export function folderNameError(name, siblings, selfId = null) {
  const value = String(name ?? '').trim();
  if (!value) return 'Enter a folder name.';
  if (/[\\/]/.test(value)) return 'A folder name can’t contain / or \\.';
  if (value.length > NAME_MAX) return `Keep the name under ${NAME_MAX} characters.`;
  const clash = siblings.some((f) => f.id !== selfId && f.name.trim().toLowerCase() === value.toLowerCase());
  if (clash) return 'A folder with this name already exists here.';
  return '';
}

export function recordingTitleError(title) {
  const value = String(title ?? '').trim();
  if (!value) return 'Enter a title.';
  if (value.length > TITLE_MAX) return `Keep the title under ${TITLE_MAX} characters.`;
  return '';
}
