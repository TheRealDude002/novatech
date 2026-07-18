export const notFound = (req, res, next) => {
  res.status(404).json({ message: `The route ${req.originalUrl} does not exist.` });
};

export const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Something went wrong on our side. We are looking into it.';

  if (err.name === 'ValidationError') {
    status = 422;
    message = 'Some fields failed validation.';
    return res.status(status).json({
      message,
      errors: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    });
  }
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `That ${field} is already in use.`;
  }
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}.`;
  }

  if (status >= 500) {
    console.error('  [error]', err.stack || err.message);
  }

  res.status(status).json({ message });
};
