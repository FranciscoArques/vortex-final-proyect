const Speciality = require('../models/speciality');
const HttpError = require('../models/http-error');

const showAllSpecialitiesData = async (req, res, next) => {
    try {
        const specialities = await Speciality.find();
        res.status(200).json({specialities});
    } catch(err){
        const error = new HttpError('Could not find all requested specialities information.', 500);
        return next(error);
    };
}

exports.showAllSpecialitiesData = showAllSpecialitiesData;