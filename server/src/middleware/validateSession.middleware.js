import { validateSession, getSession } from '../sessions/sessionManager.js';

function validateSessionMiddleware(req, res, next) {
  try {
    const sessionId = req.header('X-Session-ID');

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing X-Session-ID header',
      });
    }

    const valid = validateSession(sessionId);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
    }

    req.session = session;
    return next();
  } catch (err) {
    return next(err);
  }
}

export { validateSessionMiddleware };
