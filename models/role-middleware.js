const HttpError = require('./http-error');

const checkAdminRole = (req, res, next) => {
    const user = req.user;

    if (!user || user.role !== 'admin') {
        return next(
            new HttpError( 'Unauthorized. Admin role required.', 403 )
        )
    }

    next();
};

const checkPatientRole = (req, res, next) => {
    const user = req.user;

    if (!user || user.role !== 'patient') {
        return next(
            new HttpError( 'Unauthorized. Patient role required.', 403 )
        )
    }

    next();
};

exports.checkAdminRole = checkAdminRole;
exports.checkPatientRole = checkPatientRole;
