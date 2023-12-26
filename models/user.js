const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const HttpError = require('../models/http-error');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { 
        type: String, 
        required: true,
        unique: true, 
        trim: true, 
        lowercase: true,
        validate(value) {
            if ( !validator.isEmail(value) ) {
                return next( 
                    new HttpError('Email is invalid.', 422)
                );
            }
        }
    },
    age: { type: Number, required: true },
    role: { type: String, trim: true, lowercase: true, enum: ['admin', 'patient'], default: 'patient' },
    password: { type: String, required: true, trim: true },
    tokens: [{ type: String }]
});

//Hash user's password
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

module.exports = mongoose.model('User', userSchema);