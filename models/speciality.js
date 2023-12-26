const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Doctor = require('../models/doctor');

const removeSpaces = (value) => {
    return value.trim();
};

const specialitySchema = new Schema({
    speciality: { type: String, required: true, set: (value) => removeSpaces(value).toUpperCase() },
    doctor: [{ type: Object, ref: Doctor, required: true }],
});

module.exports = mongoose.model('Speciality', specialitySchema);