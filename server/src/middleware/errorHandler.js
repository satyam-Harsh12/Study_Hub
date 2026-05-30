// Basic error handler to keep JSON shape consistent
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || 'Server error';
  res.status(status).json({ message });
};


