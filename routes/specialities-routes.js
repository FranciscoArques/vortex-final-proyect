const express = require('express');
const specialitiesControllers = require('../controllers/specialities-controllers');
const paginationMiddleware = require('../middleware/pagination-middleware');
const router = express.Router();

//show all specialities
router.get('/', paginationMiddleware.handlePagination, specialitiesControllers.showAllSpecialitiesData);

module.exports = router;