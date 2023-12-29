const User = require('../models/user');
const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');
require('dotenv').config();

const jwtSecretKey = process.env.JWT_SECRET_KEY || 'defaultSecretKey';

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
                return next(new HttpError('Unauthorized. No token provided.', 401));
            }

        const decoded = jwt.verify(token, jwtSecretKey);
        const user = await User.findOne({ _id: decoded.userId, 'tokens.token': token });

        if (!user) {
            return next(new HttpError('Unauthorized. No matching user for token provided.', 401));
        }

        req.user = user;

        next();
    } catch(err){
        const error = new HttpError('Authentication failed.', 400);
        return next(error);
    }
};

exports.authenticateUser = authenticateUser;