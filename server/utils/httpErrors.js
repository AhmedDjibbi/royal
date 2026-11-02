export const sendServerError = (res, message, error) => {
  console.error(message, error);
  return res.status(500).json({
    message,
    ...(process.env.NODE_ENV === 'development' ? { error: error.message } : {})
  });
};
