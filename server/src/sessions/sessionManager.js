import crypto from 'crypto';

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

const sessions = new Map();

/**
 * Session structure:
 * {
 *   sessionId: "...",
 *   answers: {},
 *   createdAt: Date.now(),
 *   expiresAt: Date.now() + 30 minutes
 * }
 */

function now() {
  return Date.now();
}

function createSession() {
  const sessionId = crypto.randomUUID();
  const createdAt = now();
  const expiresAt = createdAt + THIRTY_MINUTES_MS;

  const session = {
    sessionId,
    answers: {},
    createdAt,
    expiresAt,
  };

  sessions.set(sessionId, session);
  return session;
}

function getSession(sessionId) {
  if (!sessionId) return null;

  const session = sessions.get(sessionId);
  if (!session) return null;

  if (session.expiresAt <= now()) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

function updateSession(sessionId, updates) {
  const session = getSession(sessionId);
  if (!session) return null;

  const merged = {
    ...session,
    ...updates,
  };

  sessions.set(sessionId, merged);
  return merged;
}

function deleteSession(sessionId) {
  if (!sessionId) return false;
  return sessions.delete(sessionId);
}

function validateSession(sessionId) {
  const session = getSession(sessionId);
  return !!session;
}

function expireSession(sessionId) {
  if (!sessionId) return false;
  const session = sessions.get(sessionId);
  if (!session) return false;

  session.expiresAt = now() - 1;
  sessions.set(sessionId, session);

  // Cleanup immediately for simplicity
  return deleteSession(sessionId);
}

function cleanupExpiredSessions() {
  const t = now();
  for (const [sessionId, session] of sessions.entries()) {
    if (!session || session.expiresAt <= t) {
      sessions.delete(sessionId);
    }
  }
}

const CLEANUP_INTERVAL_MS = 60 * 1000;

// Start automatic cleanup (MVP/in-memory)
setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL_MS).unref();

export {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  validateSession,
  expireSession,
  cleanupExpiredSessions,
};
