const HttpError = require('../models/http-error');

const checkAdminRole = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user || user.role !== 'admin') {
            return next(
                new HttpError( 'Unauthorized. Admin role required.', 403 )
            )
        }

    } catch (error) {
        return next(
            new HttpError('Error verifying user session.', 500)
        );
    }

    next();
};

const checkPatientRole = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user || user.role !== 'patient') {
            return next(
                new HttpError( 'Unauthorized. Patient role required.', 403 )
            )
        }

    } catch (error) {
        return next(
            new HttpError('Error verifying user session.', 500)
        );
    }

    next();
};

exports.checkAdminRole = checkAdminRole;
exports.checkPatientRole = checkPatientRole;
