const Doctor = require('../models/doctor');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

const createDoctor = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data', 422)
        );
    };

    const { name, speciality, gender, age } = req.body;
    const createdDoctor = new Doctor({
        name,
        speciality,
        gender,
        age,
    });

    try{
        await createdDoctor.save();
    }catch(err){
        const error = new HttpError('Creating Doctor failed, please try again', 500);
        return next(error);
    };

    res.status(201).json({doctor: createdDoctor});
};

exports.createDoctor = createDoctor;