export function getTokenPayload() {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export function getUserRole() {
  const payload = getTokenPayload();
  return payload?.role ?? null;
}

export function getUserSeq() {
  const payload = getTokenPayload();
  return payload?.userSeq ?? null;
}

export function getUserIdentifier() {
  const payload = getTokenPayload();
  return payload?.sub ?? null;
}

export function isTokenExpired() {
  const payload = getTokenPayload();
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

const SESSION_EXPIRED_KEY = 'sessionExpired';

export function markSessionExpired() {
  sessionStorage.setItem(SESSION_EXPIRED_KEY, 'true');
}

export function consumeSessionExpiredFlag() {
  const wasExpired = sessionStorage.getItem(SESSION_EXPIRED_KEY) === 'true';
  if (wasExpired) {
    sessionStorage.removeItem(SESSION_EXPIRED_KEY);
  }
  return wasExpired;
}

const ACCOUNT_DEACTIVATED_KEY = 'accountDeactivated';

export function markAccountDeactivated() {
  sessionStorage.setItem(ACCOUNT_DEACTIVATED_KEY, 'true');
}

export function consumeAccountDeactivatedFlag() {
  const wasDeactivated = sessionStorage.getItem(ACCOUNT_DEACTIVATED_KEY) === 'true';
  if (wasDeactivated) {
    sessionStorage.removeItem(ACCOUNT_DEACTIVATED_KEY);
  }
  return wasDeactivated;
}