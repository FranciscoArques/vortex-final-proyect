const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorSchema = new Schema({
    name: { type: String, required: true },
    speciality: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: Number, required: true },
});

module.exports = mongoose.model('Doctor', doctorSchema);