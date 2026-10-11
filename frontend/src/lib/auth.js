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

// Renew the JWT this long before it actually expires, so requests don't race the expiry.
export const TOKEN_REFRESH_MARGIN_SECONDS = 60;

export function isTokenExpired(marginSeconds = 0) {
  const payload = getTokenPayload();
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now + marginSeconds;
}

const LOGIN_PATHS = {
  student: '/login',
  tutor: '/teacher/login',
  instructor: '/instructor/login',
  cashier: '/cashier/login',
  admin: '/admin/login',
};

export function getLoginPath(role) {
  return LOGIN_PATHS[role] ?? null;
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

// Device id for the one-device-per-student rule. The backend generates it on first login (and
// again after an admin re-activates a blocked account); the browser only keeps it. Stored per
// account so students sharing a computer don't overwrite each other's id, and in localStorage
// (not sessionStorage) so logout, which only clears sessionStorage, leaves it in place.
function deviceIdKey(userSeq) {
  return `deviceId:${userSeq}`;
}

export function getDeviceId(userSeq) {
  try {
    return localStorage.getItem(deviceIdKey(userSeq));
  } catch {
    return null;
  }
}

export function saveDeviceId(userSeq, deviceId) {
  localStorage.setItem(deviceIdKey(userSeq), deviceId);
}

// Checked before registering: if this browser can't keep the id, the next login would look like
// another device and get the account blocked.
export function canStoreDeviceId() {
  try {
    localStorage.setItem('deviceId:test', '1');
    localStorage.removeItem('deviceId:test');
    return true;
  } catch {
    return false;
  }
}
