const Speciality = require('../models/speciality');
const HttpError = require('../models/http-error');

const showAllSpecialitiesData = async (req, res, next) => {
    try {
        const { limit, skip } = req.pagination;
        const specialities = await Speciality.find().skip(skip).limit(limit);

        res.status(200).json({specialities});
    } catch(err){
        const error = new HttpError('Could not find all requested specialities information.', 400);
        return next(error);
    };
}

exports.showAllSpecialitiesData = showAllSpecialitiesData;