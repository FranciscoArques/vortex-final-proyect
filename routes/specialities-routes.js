const express = require('express');
const specialitiesControllers = require('../controllers/specialities-controllers');
const router = express.Router();

//show all specialities
router.get('/', specialitiesControllers.showAllSpecialitiesData);

module.exports = router;