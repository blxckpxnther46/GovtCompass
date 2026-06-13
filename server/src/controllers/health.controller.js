const getHealth = (req, res) => {
  // Helps confirm whether the backend is actually receiving the request.
  console.log('[health] GET /api/health hit', {
    method: req.method,
    path: req.originalUrl,
    time: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Backend is healthy',
    timestamp: new Date().toISOString(),
  });
};

export { getHealth };

