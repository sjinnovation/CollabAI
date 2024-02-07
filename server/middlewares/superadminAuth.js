import { StatusCodes } from 'http-status-codes';
import config from '../config.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';

function validateToken(token) {
	return typeof token === 'string' && token.trim() !== '';
}

export async function authenticateSuperAdmin(req, res, next) {
	try {
		if (!req.headers['authorization']) {
			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ message: 'No authorization headers sent' });
		}

		const token = req.headers['authorization'].split(' ')[1];
		// Check if the token exists and is valid
		if (!token || !validateToken(token)) {
			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ message: 'Invalid token' });
		}

		const decodedToken = jwt.verify(token, config.JWT_SECRET);
		const curTime = new Date().getTime() / 1000;

		if (decodedToken.exp < curTime) {
      res.setHeader('x-token-expiry', 'true');
			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ message: 'Token expired' });
		}
		console.log(decodedToken.userId);

		const user = await User.findOne({ _id: decodedToken.userId });
		if (user && user?._id && user.role === 'superadmin') {
			req.user = user;
		} else if (user.role !== 'superadmin') {
			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ message: 'User not authorized' });
		} else {
			return res.status(404).json({ error: 'User not found' });
		}
		// Token is valid, continue to the next middleware or route handler
		next();
	} catch (e) {
		return res
			.status(500)
			.json({
				error: 'Error occured while validating authentication token',
				message: e.message,
			});
	}
}
