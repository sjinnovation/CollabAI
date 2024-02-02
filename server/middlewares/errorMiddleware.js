import { CommonMessages } from '../constants/enums.js';

export const invalidRequest = (req, res, next) => {
  res.status(404).json({
    error: `${CommonMessages.BAD_REQUEST_ERROR} - ${req.originalUrl}`,
  });
  next();
};

export const errorLogger = (err, req, res, next) => {
  const statusCode = err.statusCode ? err.statusCode : 500;
  const message = err.message ? err.message : CommonMessages.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({ message: message });
  next();
};
 
