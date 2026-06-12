/**
 * Global error handler
 * Ensures a consistent JSON response shape.
 */
function errorMiddleware(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const statusCode = err?.statusCode || err?.status || 500;

  const message =
    err?.expose && err?.message
      ? err.message
      : statusCode === 500
        ? 'Internal server error'
        : err?.message || 'Request failed';

  // eslint-disable-next-line no-console
  console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
  });
}

export { errorMiddleware };
