const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/user');
//const { default: isEmail } = require('validator/lib/isEmail');

const ShowAllAppointments = async (req, res, next) => {
    try {
        const { limit, skip } = req.pagination;
        const appointments = await Appointment.find().skip(skip).limit(limit);

        res.status(200).json({appointments});
    } catch(err){
        const error = new HttpError('Could not find all requested appointments information.', 400);
        return next(error);
    };
}

const getAppointmentById = async (req, res, next) => {
    const appointmentId = req.params.id;
    const { limit, skip } = req.pagination;

    try {
        const appointment = await Appointment.findById(appointmentId).skip(skip).limit(limit);

        if(!appointment){
            return next(
                new HttpError('Could not find a matching appointment for the provided id.', 404)
            );
        }

        res.status(200).json({appointment: appointment});
    } catch(err){
        const error = new HttpError('Could not find the requested appointment information.', 400);
        return next(error);
    };
}

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
            //moment.js librería
            //date: date.day + '/' + date.month + '/' + date.year + ' at ' + time.hour + ':' + time.minutes,
            date: date + ' at ' + time,
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
        const error = new HttpError('Creating appointment failed, please try again.', 400);
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

    const { date, status, doctorId } = req.body;
    const appointmentId = req.params.id;

    try {
        const appointment = await Appointment.findById(appointmentId);
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return next(new HttpError('Doctor not found.', 404));
        }

        appointment.date = date !== undefined ? date : appointment.date;
        appointment.status = status !== undefined ? status : appointment.status;
        appointment.doctor.id = doctorId !== undefined ? appointment.doctor = doctor : appointment.doctor.id;
        appointment.__v += 1;

        await appointment.save();

        res.status(200).json({ appointment: appointment });

    } catch (err) {
        const error = new HttpError("Could not update the requested appointment.", 400);
        return next(error);
    }
};

const deleteAppointmentById = async (req, res, next) => {
    const appointmentId = req.params.id;

    try {
        await Appointment.findByIdAndDelete(appointmentId);

        res.status(200).json({message: 'Deleted appointment.'});
    } catch(err){
        const error = new HttpError('Could not delete appointment.', 400);
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

        const { limit, skip } = req.pagination;
        const paginatedDoctorsAppointments = doctorAppointments.slice(skip, skip + limit);

        res.status(200).json({paginatedDoctorsAppointments});
    } catch(err){
        const error = new HttpError("Could not find requested doctor's appointments.", 400);
        return next(error);
    };
};

const arrangeAppointment = async (req, res, next) => {
    const appointmentId = req.params.id;

    try {
        const appointment = await Appointment.findById(appointmentId);

        if ( appointment.status === 'taken' ) {
            res.status(200).json({message: 'Appointment already arranged.'})
        }

        appointment.status = 'taken';
        appointment.takenBy.user = req.user;
        appointment.takenBy.user.id = req.user._id;

        await appointment.save();

        res.status(200).json({ appointment: appointment });

    } catch (err) {
        const error = new HttpError("Could not arrange appointment.", 400);
        return next(error);
    }
};

const disarrangeAppointment = async (req, res, next) => {
    const appointmentId = req.params.id;

    try {
        const appointment = await Appointment.findById(appointmentId);

        if ( appointment.status === 'available' ) {
            res.status(200).json({message: 'Appointment already arranged.'})
        }

        appointment.status = 'available';
        

        appointment.takenBy = {};
        await Appointment.findOneAndUpdate(
            { _id: appointmentId },
            { $unset: { 'takenBy': 1 } }
        );

        const userId = req.user._id;
        const userName = req.user.name;
        const userEmail = req.user.email;
        const userAge = req.user.age;

        const isInArray = appointment.canceledBy.some(e => e.user && e.user.email === userEmail);

        if ( !isInArray ) {

            appointment.canceledBy.push({ user: {
                name: userName, 
                email: userEmail, 
                age: userAge, 
                id: userId,
            } });

        } else {
            const userIndex = appointment.canceledBy.findIndex(item => item.user && item.user.email === userEmail);
            appointment.canceledBy[userIndex].timesCanceled += 1;
        }

        await appointment.save();

        res.status(200).json({ appointment: appointment });

    } catch (err) {
        const error = new HttpError("Could not disarrange appointment.", 400);
        return next(error);
    }
};

const showPatientsAppointment = async (req, res, next) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId)

        if ( !user ) {
            return next(new HttpError('User not found.', 404))
        }
        
        const appointment = await Appointment.find()

        let userAppointments = [];

        appointment.forEach(appointment => {
            if ( userId == appointment.takenBy.user.id ) {
                userAppointments.push(appointment);
            } else {
                userAppointments;
            }
        });

        if ( userAppointments.length === 0) {
            res.status(200).json({message: 'No appointments found for requested user.'})
        }

        const { limit, skip } = req.pagination;
        const paginatedUserAppointments = userAppointments.slice(skip, skip + limit);

        res.status(200).json({ paginatedUserAppointments });

    } catch (err) {
        const error = new HttpError("Could not match user's appointment.", 400);
        return next(error);
    }
};

const showPatientsCanceledAppointment = async (req, res, next) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);

        if ( !user ) {
            return next(new HttpError('User not found.', 404));
        }

        const appointment = await Appointment.find();

        let userAppointments = [];

        appointment.forEach(e => {
            if ( e.canceledBy.length !== 0 ) {

                e.canceledBy.forEach(e => { 
                    if ( userId == e.user.id ) {
                        userAppointments.push(e);
                    } else {
                        userAppointments;
                    }
                })

            }
        });

        if ( userAppointments.length === 0) {
            res.status(200).json({message: 'No appointments found for requested user.'})
        }

        const { limit, skip } = req.pagination;
        const paginatedUserAppointments = userAppointments.slice(skip, skip + limit);

        res.status(200).json({ paginatedUserAppointments });

    } catch (err) {
        const error = new HttpError("Could not match user's appointment.", 400);
        return next(error);
    }
};

exports.ShowAllAppointments = ShowAllAppointments;
exports.getAppointmentById = getAppointmentById;
exports.createAppointment = createAppointment;
exports.updateAppointmentById = updateAppointmentById;
exports.deleteAppointmentById = deleteAppointmentById;
exports.showDoctorAppointments = showDoctorAppointments;
exports.arrangeAppointment = arrangeAppointment;
exports.disarrangeAppointment = disarrangeAppointment;
exports.showPatientsAppointment = showPatientsAppointment;
exports.showPatientsCanceledAppointment = showPatientsCanceledAppointment;