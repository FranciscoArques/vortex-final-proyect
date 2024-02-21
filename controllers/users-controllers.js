const User = require('../models/user');
const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
require('dotenv').config();

const jwtSecretKey = process.env.JWT_SECRET_KEY || 'defaultSecretKey';

const ShowUsers = async (req, res, next) => {
    try {
        const { limit, skip } = req.pagination;
        const users = await User.find().skip(skip).limit(limit);

        res.status(200).json({users});
    } catch(err){
        const error = new HttpError('Could not find all requested users information.', 400);
        return next(error);
    };
}

const registerUser = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        const errorMessages = error.errors.map(e => e.msg);
        return next(
            new HttpError( errorMessages.join(' '), 422 )
        );
    };

    const { name, email, age, role, password } = req.body;

    //Password Validation for more security
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,10}$/;
    if (!passwordRegex.test(password)) {
        return next(
            new HttpError('Password must contain at least one uppercase letter, one lowercase letter, one number, and be 8 to 10 characters long.', 400)
        )
    };

    try {
        //User password hashed
        const hashedPassword = await bcrypt.hash(password.trim(), 8);
        const newUser = new User({ name, email, age, role, password: hashedPassword });
        await newUser.save();

        res.status(201).json({user: newUser});
    } catch(err){
        const error = new HttpError('Creating User failed, please try again.', 500);
        return next(error)
    }
};

const loginUser = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        const errorMessages = error.errors.map(e => e.msg);
        return next(
            new HttpError( errorMessages.join(' '), 422 )
        );
    };

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        const match = await bcrypt.compare(password.trim(), user.password);

        if (!user) {
            return next(
                new HttpError('User does not exist.', 401)
            )
        }

        if (!match) {
            return next(
                new HttpError('Invalid password for requested user.', 401)
            )
        }

        //Create a JWT token and add it to the tokens array
        const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecretKey, { expiresIn: '3h' });
        user.tokens = user.tokens.concat({ token });
        await user.save();

        res.status(201).json({ userId: user._id, name: user.name, role: user.role, email: user.email, token });
    } catch(err){
        const error = new HttpError('Log-in User failed, please try again.', 500);
        return next(error);
    }
};

const logoffUser = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        const errorMessages = error.errors.map(e => e.msg);
        return next(
            new HttpError( errorMessages.join(' '), 422 )
        );
    };
    
    const { userId, tokenToRevoke } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return next(
                new HttpError('User not found.', 404)
            )
        }

        //Check if token match with user's and remove it
        const tokenIndex = user.tokens.findIndex(tokenObj => tokenObj.token === tokenToRevoke);

        if (tokenIndex === -1) {
            return next(
                new HttpError('Invalid token to log-off.', 401)
            )
        }

        user.tokens.splice(tokenIndex, 1);
        await user.save();

        res.status(201).json({ message: 'User logged off successfully.' });
    } catch (err) {
        const error = new HttpError('Log-off User failed, please try again.', 500);
        return next(error);
    }
};

exports.ShowUsers = ShowUsers;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.logoffUser = logoffUser;