const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const HttpError = require('../models/http-error');
const validator = require('validator');

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
    tokens: [{ token: { type: String, required: true } }]
});

module.exports = mongoose.model('User', userSchema);