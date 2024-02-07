// const rateLimit = require("express-rate-limit");
// var jwt = require("jsonwebtoken");
// const locale = require("../locale");
// var jwt = require("jsonwebtoken");
// import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
// const locale = require("../locale/index.cjs");
 import * as locale from "../locale/index.js";
import User from "../models/user.js";
import config from '../config.js';  

export const userActions = {
  login: { maxAttempts: 500, mins: 60, message: locale.LOGIN_MANY_ATTEMPT },
  register: { maxAttempts: 500, mins: 60, message: locale.SIGNUP_MANY_ATTEMPT },
  forgotPassword: {
    maxAttempts: 500,
    mins: 60,
    message: locale.FORGOTPASS_MANY_ATTEMPT,
  },
};


export const actionLimitter = (action) =>
  rateLimit({
    windowMs: 1000 * 60 * action.mins,
    max: action.maxAttempts,
    message: action.message,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
    handler: (req, res, next, options) =>
      res.status(options.statusCode).send({ errorMessage: options.message }),
  });

export const  authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("authHeader",authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log("token",token);
  if (token == null) return res.sendStatus(403);
  jwt.verify(token, process.env.SALT_HASH, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
    next();
  });
}
function validateToken(token) {
  return typeof token === 'string' && token.trim() !== '';
}

export const authorizeUserAction = (resourceUser, reqUser) => {
  if(reqUser.role === 'superadmin') return true;
  if(resourceUser.toString() === reqUser._id.toString()) return true;
  return false;
}

// Middleware function to validate header tokens
async function authenticateUser(req, res, next) {
  // Get the token from the request headers
  try {

    if (!req.headers['authorization']) {
      return res.status(401).json({ error: 'No authorization headers sent' });
    }

    const token = req.headers['authorization'].split(' ')[1];
    // Check if the token exists and is valid
    if (!token || !validateToken(token)) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const decodedToken = jwt.verify(token, config.JWT_SECRET, { ignoreExpiration: true });
    const curTime = new Date().getTime() / 1000;

    if (decodedToken.exp < curTime) {
      res.setHeader('x-token-expiry', 'true');
      return res.status(401).json({ error: 'Token expired' });
    }

    const user = await User.findOne({ _id: decodedToken.userId });
      if (user && user?._id) {
        req.user = user;
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    // Token is valid, continue to the next middleware or route handler
    next();
  } catch (e) {
    return res.status(500).json({ error: 'Error occured while validating authentication token', message: e.message });
  }
}

export default authenticateUser;

// module.exports = {
//   actionLimitter,
//   userActions,
//   authenticateToken,
// };
