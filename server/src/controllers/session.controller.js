import { createSession, updateSession } from '../sessions/sessionManager.js';

function createSessionController(req, res) {
  const session = createSession();

  return res.json({
    success: true,
    sessionId: session.sessionId,
  });
}

function answerController(req, res) {
  const { questionId, answer } = req.body || {};
  const session = req.session;

  if (!questionId || typeof questionId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid questionId',
    });
  }

  if (answer === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Missing answer',
    });
  }

  // Allow any JSON-serializable answer for MVP.
  const next = updateSession(session.sessionId, {
    answers: {
      ...(session.answers || {}),
      [questionId]: answer,
    },
  });

  if (!next) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session',
    });
  }

  return res.json({ success: true });
}

function meController(req, res) {
  const session = req.session;

  return res.json({
    success: true,
    data: {
      answers: session.answers || {},
    },
  });
}

export { createSessionController, answerController, meController };
