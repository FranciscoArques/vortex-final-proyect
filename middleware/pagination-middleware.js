const HttpError = require('../models/http-error');

const handlePagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        
        req.pagination = {
            page,
            limit,
            skip,
        };
        
        next();
    } catch(err){
        const error = new HttpError('Error handling pagination.', 500);
        return next(error);
    };
};

exports.handlePagination = handlePagination;
