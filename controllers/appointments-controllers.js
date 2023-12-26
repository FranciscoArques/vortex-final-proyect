const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

const createAppointment = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        const errorMessages = error.errors.map(e => e.msg);
        return next(
            new HttpError( errorMessages.join(' '), 422 )
        );
    };

    const { time, date, status, doctorId } = req.body;

    try{
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return next(new HttpError('Doctor not found.', 404));
        }

        const createdAppointment = new Appointment({
            date: date.day + '/' + date.month + '/' + date.year + ' at ' + time.hour + ':' + time.minutes,
            status,
            doctor: {
                id: doctorId,
                surname: doctor.surname,
                name: doctor.name,
                speciality: doctor.speciality,
                gender: doctor.gender,
                age: doctor.age
            }
        });

        await createdAppointment.save();

        res.status(201).json({appointment: createdAppointment});
    }catch(err){
        const error = new HttpError('Creating appointment failed, please try again.', 500);
        return next(error);
    };
};

const updateAppointmentById = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        const errorMessages = error.errors.map(e => e.msg);
        return next(
            new HttpError( errorMessages.join(' '), 422 )
        );
    };

    const { time, date, status, doctorId } = req.body;
    const appointmentId = req.params.id;

    try {
        const appointment = await Appointment.findById(appointmentId);
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return next(new HttpError('Doctor not found.', 404));
        }

        appointment.date = (time !== undefined && date !== undefined) ? ( date.day + '/' + date.month + '/' + date.year + ' at ' + time.hour + ':' + time.minutes ) : appointment.date;
        appointment.status = status !== undefined ? status : appointment.status;
        appointment.doctor.id = doctorId !== undefined ? appointment.doctor = doctor : appointment.doctor.id;
        appointment.__v += 1;

        await appointment.save();

        res.status(200).json({ appointment: appointment });

    } catch (err) {
        const error = new HttpError("Could not update the requested appointment.", 500);
        return next(error);
    }
};

const deleteAppointmentById = async (req, res, next) => {
    const appointmentId = req.params.id;

    try {
        await Appointment.findByIdAndDelete(appointmentId);

        res.status(200).json({message: 'Deleted appointment.'});
    } catch(err){
        const error = new HttpError('Could not delete appointment.', 500);
        return next(error);
    };
};

const showDoctorAppointments = async (req, res, next) => {
    const doctorId = req.params.id;

    try {
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return next(new HttpError('Doctor not found.', 404));
        }

        const appointments = await Appointment.find();

        let doctorAppointments = [];

        appointments.forEach(e => {
            if ( doctorId == e.doctor.id ) {
                doctorAppointments.push(e);
            } else {
                doctorAppointments;
            }
        });

        if ( doctorAppointments.length === 0) {
            res.status(200).json({message: 'No appointments found for requested doctor.'})
        }

        res.status(200).json({doctorAppointments});
    } catch(err){
        const error = new HttpError("Could not find requested doctor's appointments.", 500);
        return next(error);
    };
};

const arrangeAppointment = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        const errorMessages = error.errors.map(e => e.msg);
        return next(
            new HttpError( errorMessages.join(' '), 422 )
        );
    };

    const appointmentId = req.params.id;

    try {
        const appointment = await Appointment.findById(appointmentId);

        if ( appointment.status === 'taken' ) {
            res.status(200).json({message: 'Appointment already arranged.'})
        }

        appointment.status = 'taken';

        await appointment.save();

        res.status(200).json({ appointment: appointment });

    } catch (err) {
        const error = new HttpError("Could not arrange appointment.", 500);
        return next(error);
    }
};

const disarrangeAppointment = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        const errorMessages = error.errors.map(e => e.msg);
        return next(
            new HttpError( errorMessages.join(' '), 422 )
        );
    };

    const appointmentId = req.params.id;

    try {
        const appointment = await Appointment.findById(appointmentId);

        if ( appointment.status === 'available' ) {
            res.status(200).json({message: 'Appointment already arranged.'})
        }

        appointment.status = 'available';

        await appointment.save();

        res.status(200).json({ appointment: appointment });

    } catch (err) {
        const error = new HttpError("Could not disarrange appointment.", 500);
        return next(error);
    }
};

exports.createAppointment = createAppointment;
exports.updateAppointmentById = updateAppointmentById;
exports.deleteAppointmentById = deleteAppointmentById;
exports.showDoctorAppointments = showDoctorAppointments;
exports.arrangeAppointment = arrangeAppointment;
exports.disarrangeAppointment = disarrangeAppointment;