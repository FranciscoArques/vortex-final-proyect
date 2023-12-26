const Doctor = require('../models/doctor');
const Speciality = require('../models/speciality');
const Appointment = require('../models/appointment');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

const showAllDoctorsData = async (req, res, next) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json({doctors});
    } catch(err){
        const error = new HttpError('Could not find all requested doctors information.', 500);
        return next(error);
    };
}

const getDoctorbyId = async (req, res, next) => {
    const doctorId = req.params.id;

    try {
        const doctor = await Doctor.findById(doctorId);

        if(!doctor){
            return next(
                new HttpError('Could not find a matching doctor for the provided id.', 404)
            );
        }

        res.status(200).json({doctor: doctor});
    } catch(err){
        const error = new HttpError('Could not find the requested doctor information.', 500);
        return next(error);
    };
}

const createDoctor = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        const errorMessages = error.errors.map(e => e.msg);
        return next(
            new HttpError( errorMessages.join(' '), 422 )
        );
    };

    const { surname, name, speciality, gender, age } = req.body;

    try{
        const createdDoctor = new Doctor({
            surname,
            name,
            speciality,
            gender,
            age,
        });

        await createdDoctor.save();

        //Speciality Check
        const existingSpeciality = await Speciality.findOne({ speciality: createdDoctor.speciality });

        if (existingSpeciality) {
            existingSpeciality.doctor.push(createdDoctor);
            await existingSpeciality.save();
        } else {
            const newSpeciality = new Speciality({
                speciality: createdDoctor.speciality,
                doctor: [createdDoctor],
            });
            await newSpeciality.save()};

        res.status(201).json({doctor: createdDoctor});
    }catch(err){
        const error = new HttpError('Creating Doctor failed, please try again.', 500);
        return next(error);
    };
};

const updateDoctorById = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        const errorMessages = error.errors.map(e => e.msg);
        return next(
            new HttpError( errorMessages.join(' '), 422 )
        );
    };

    const { surname, name, speciality, gender, age } = req.body;
    const doctorId = req.params.id;

    try {
        const doctor = await Doctor.findById(doctorId);
        const oldDoctor = await Doctor.findById(doctorId);

        doctor.surname = surname !== undefined ? surname : doctor.surname;
        doctor.name = name !== undefined ? name : doctor.name;
        doctor.speciality = speciality !== undefined ? speciality : doctor.speciality;
        doctor.gender = gender !== undefined ? gender : doctor.gender;
        doctor.age = age !== undefined ? age : doctor.age;
        doctor.__v += 1;

        await doctor.save();

        //Speciality Check
        const existingSpeciality = await Speciality.findOne({ speciality: doctor.speciality });

        if (oldDoctor.speciality !== doctor.speciality) {
            const oldSpeciality = await Speciality.findOne({ speciality: oldDoctor.speciality });
            oldSpeciality.doctor.pull(oldDoctor);
            await oldSpeciality.save();

            //Delete Old Speciality if no doctors have that speciality
            const updatedOldSpeciality = await Speciality.findOne({ speciality: oldDoctor.speciality });
            if (JSON.stringify(updatedOldSpeciality.doctor).length === 2) {
                try {
                    await Speciality.findOneAndDelete({ speciality: oldDoctor.speciality });
                } catch (err) {
                    const error = new HttpError("Could not delete old speciality with no doctors.", 500);
                    return next(error);
                }
            };

        }else {
            existingSpeciality.doctor.pull(oldDoctor);
            await existingSpeciality.save();
        }

        if (existingSpeciality) {
            existingSpeciality.doctor.push(doctor);
            await existingSpeciality.save();

        } else {
            const newSpeciality = new Speciality({
                speciality: doctor.speciality,
                doctor: [doctor],
            });
            await newSpeciality.save();
        }

        //Appointment check
        try {
            await Appointment.updateMany(
                { 'doctor.id': doctorId },
                {
                    $set: {
                        'doctor.surname': doctor.surname,
                        'doctor.name': doctor.name,
                        'doctor.speciality': doctor.speciality,
                        'doctor.gender': doctor.gender,
                        'doctor.age': doctor.age
                    }
                }
            );

        } catch (err) {
            const error = new HttpError("Could find doctor appointment.", 500);
            return next(error);
        }

        res.status(200).json({ doctor: doctor });

    } catch (err) {
        const error = new HttpError("Could not update the requested doctor or the requested doctor's speciality.", 500);
        return next(error);
    }
};

exports.showAllDoctorsData = showAllDoctorsData;
exports.getDoctorbyId = getDoctorbyId;
exports.createDoctor = createDoctor;
exports.updateDoctorById = updateDoctorById;