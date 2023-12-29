const express = require('express');
const { check } = require('express-validator');
const doctorsControllers = require('../controllers/doctors-controllers');
const authMiddleware = require('../middleware/auth-middleware');
const roleMiddleware = require('../middleware/role-middleware');
const paginationMiddleware = require('../middleware/pagination-middleware');
const router = express.Router();

//show all doctors
router.get('/', paginationMiddleware.handlePagination, doctorsControllers.showAllDoctorsData);

//get doctor by id
router.get('/:id', paginationMiddleware.handlePagination, doctorsControllers.getDoctorbyId);

//create doctor
//quick side note: /^[a-zA-Z\u00C0-\u017F\u00FC\s']+$/ allows letters, accented characters, "ü", spaces, and single quotes. No other special characters allowed.
router.post(
    '/',
    authMiddleware.authenticateUser,
    roleMiddleware.checkAdminRole,
    [
        check('surname').notEmpty().withMessage('A Surname is required.').matches(/^[a-zA-Z\u00C0-\u017F\u00FC\s']+$/).withMessage('No special characters allowed in Surname.'),
        check('name').notEmpty().withMessage('A Name is required.').matches(/^[a-zA-Z\u00C0-\u017F\u00FC\s']+$/).withMessage('No special characters allowed in Name.'),
        check('speciality').notEmpty().withMessage('A Speciality is required.').matches(/^[a-zA-Z\u00C0-\u017F\u00FC\s']+$/).withMessage('No special characters allowed in Speciality.'),
        check('gender').notEmpty().withMessage('A Gender is required.').matches(/^[a-zA-Z\u00C0-\u017F\u00FC\s']+$/).withMessage('No special characters allowed in Gender.'),
        check('age').notEmpty().withMessage('An Age is required.').isInt({ min: 1, max: 99 }).withMessage('Age must be an integer between 1 and 99'),
    ], 
    doctorsControllers.createDoctor
);

//update doctor
router.patch(
    '/:id',
    authMiddleware.authenticateUser,
    roleMiddleware.checkAdminRole,
    [
        check('surname').optional().notEmpty().withMessage('A Surname is required.').matches(/^[a-zA-Z\u00C0-\u017F\u00FC\s']+$/).withMessage('No special characters allowed in Surname.'),
        check('name').optional().notEmpty().withMessage('A Name is required.').matches(/^[a-zA-Z\u00C0-\u017F\u00FC\s']+$/).withMessage('No special characters allowed in Name.'),
        check('speciality').optional().notEmpty().withMessage('A Speciality is required.').matches(/^[a-zA-Z\u00C0-\u017F\u00FC\s']+$/).withMessage('No special characters allowed in Speciality.'),
        check('gender').optional().notEmpty().withMessage('A Gender is required.').matches(/^[a-zA-Z\u00C0-\u017F\u00FC\s']+$/).withMessage('No special characters allowed in Gender.'),
        check('age').optional().notEmpty().withMessage('An Age is required.').isInt({ min: 1, max: 99 }).withMessage('Age must be an integer between 1 and 99'),
    ], 
    doctorsControllers.updateDoctorById
);

module.exports = router;
