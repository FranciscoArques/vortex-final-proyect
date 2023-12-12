const express = require('express');
const { check } = require('express-validator');
const doctorsControllers = require('../controllers/doctors-controllers');
const router = express.Router();

router.get('/', (req, res, next) => {
    console.log('GET request works!');
    res.json({message: 'It works!'});
});

//create doctor
router.post(
    '/',
    [
        check('name').not().isEmpty(),
        check('speciality').not().isEmpty(),
        check('gender').not().isEmpty(),
        check('age').not().isEmpty(),
    ], 
    doctorsControllers.createDoctor
);

module.exports = router;
