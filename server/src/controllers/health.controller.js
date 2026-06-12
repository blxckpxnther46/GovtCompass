const getHealth = (req, res) => {
  res.json({
    success: true,
    message: 'Backend is healthy',
    timestamp: new Date().toISOString(),
  });
};

export { getHealth };

