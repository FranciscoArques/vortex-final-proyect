const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const removeSpaces = (value) => {
    return value.trim();
};

const doctorSchema = new Schema({
    surname: {
        type: String,
        required: true,
        set: (value) => removeSpaces(value).toUpperCase()
    },
    name: {
        type: String,
        required: true,
        set: (value) => removeSpaces(value).toUpperCase()
    },
    speciality: {
        type: String,
        required: true,
        set: (value) => removeSpaces(value).toUpperCase()
    },
    gender: {
        type: String,
        required: true,
        set: (value) => removeSpaces(value).toUpperCase()
    },
    age: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('Doctor', doctorSchema);