const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Doctor = require('../models/doctor');
const User = require('../models/user');

const appointmentSchema = new Schema({
    date: { type: String, required: true },
    status: { type: String, required: true, enum: ['taken', 'available'] },
    doctor: { 
        id: { type: Schema.Types.ObjectId, ref: Doctor, required: true },
        surname: { type: String, required: true },
        name: { type: String, required: true },
        speciality: { type: String, required: true },
        gender: { type: String, required: true },
        age: { type: Number, required: true },
    },
    takenBy: {
        user: {
            id: { type: Schema.Types.ObjectId, ref: User },
            name: { type: String },
            email: { type: String },
            age: { type: Number },
        }
    },
    canceledBy: [{
        user: {
            id: { type: Schema.Types.ObjectId, ref: User },
            name: { type: String },
            email: { type: String },
            age: { type: Number },
        },
        timesCanceled: { type:Number, default:0 }
    }]
});

module.exports = mongoose.model('Appointment', appointmentSchema);