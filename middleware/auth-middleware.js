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

//Forgot Password

// const User = require('../models/user');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');

// exports.requestPasswordReset = async (req, res, next) => {
//     const { email } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         const token = jwt.sign({ email }, 'your_secret_key', { expiresIn: '1h' });

//         // Store token in the user document
//         user.passwordResetToken = token;
//         user.passwordResetExpires = Date.now() + 3600000; // 1 hour
//         await user.save();

//         // Send email with reset link
//         const transporter = nodemailer.createTransport({
//             // Your email transporter configuration
//         });

//         const mailOptions = {
//             // Your email content and reset link with token
//         };

//         await transporter.sendMail(mailOptions);

//         res.status(200).json({ message: 'Password reset email sent.' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// };
