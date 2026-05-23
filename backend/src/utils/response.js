/**
 * Success Response Helper
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error Response Helper
 */
const sendError = (res, message = 'Error', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
