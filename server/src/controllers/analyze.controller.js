function analyzeController(req, res) {
  const session = req.session || {};
  const answers = session.answers || {};

  // MVP eligibility engine placeholder:
  // Build "profile" from existing session answers.
  const profile = {
    answers,
  };

  return res.json({
    success: true,
    message: 'Eligibility engine not implemented yet',
    profile,
  });
}

export { analyzeController };
