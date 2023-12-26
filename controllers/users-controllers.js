const User = require('../models/user');
const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//Load the secret key from environment variables
const jwtSecretKey = process.env.JWT_SECRET_KEY || 'defaultSecretKey';

const registerUser = async (req, res, next) => {
    const { name, email, age, role, password } = req.body;

    //Password Validation for more security
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,10}$/;
    if (!passwordRegex.test(password)) {
        return next(
            new HttpError('Password must contain at least one uppercase letter, one lowercase letter, one number, and be 8 to 10 characters long.', 402)
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
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password.trim(), user.password))) {
            console.log((await bcrypt.compare(password.trim(), user.password)))
            return next(
                new HttpError('Invalid credentials for requested user.', 402)
            )
        }

        //Create a JWT token and add it to the tokens array
        const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecretKey, { expiresIn: '3h' });
        user.tokens = user.tokens.concat(token);
        await user.save();

        res.status(201).json({ userId: user._id, email: user.email, token });
    } catch(err){
        const error = new HttpError('Log-in User failed, please try again.', 500);
        return next(error);
    }
};

const logoffUser = async (req, res, next) => {
    const { userId, tokenToRevoke } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return next(
                new HttpError('User not found.', 404)
            )
        }

        //Check if token match with user's and remove it
        const tokenIndex = user.tokens.indexOf(tokenToRevoke);

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

exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.logoffUser = logoffUser;