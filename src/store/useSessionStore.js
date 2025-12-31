const STORAGE_KEY = 'bbl_sessions_v2';

function readSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Unable to parse sessions', e);
    return [];
  }
}

function writeSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Unable to save sessions', e);
  }
}

export function saveSession(data) {
  const sessions = readSessions();
  const session = { ...data, timestamp: Date.now() };
  const existingIndex = sessions.findIndex((s) => s.id === session.id);
  if (existingIndex >= 0) sessions[existingIndex] = session; else sessions.push(session);
  writeSessions(sessions);
  return session;
}

export function saveSessionData({ id, name, strokes, duration, speed, pingPong, presence, ghost }) {
  const session = saveSession({
    id: id || Date.now(),
    name,
    strokes,
    duration,
    speed,
    pingPong,
    presence,
    ghost,
  });
  return session;
}

export function loadSession(id) {
  return readSessions().find((session) => session.id === id) || null;
}

export function deleteSession(id) {
  writeSessions(readSessions().filter((session) => session.id !== id));
}

export function listSessions() {
  return readSessions();
}

export function clearSessions() {
  writeSessions([]);
}
