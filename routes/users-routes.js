const express = require('express');
const { check } = require('express-validator');
const usersControllers = require('../controllers/users-controllers');
const router = express.Router();

//Register user
router.post(
    '/register',
    [
        check('name').notEmpty().withMessage('A name is required.'),
        check('email').notEmpty().toLowerCase().isEmail().withMessage('An email is required.'),
        check('age').notEmpty().withMessage('An age is required.').isInt({ min: 1, max: 99 }).withMessage('Age must be an integer between 1 and 99'),
        check('role').toLowerCase().isIn(['admin','patient']).withMessage('Only "admin" or "patient" roles accepted.'),
        check('password').notEmpty().isLength( {min: 8, max: 10} ).withMessage('A password is required.'),
    ],
    usersControllers.registerUser
);

//Login user
router.post(
    '/login',
    [
        check('email').notEmpty().trim().toLowerCase().isEmail().withMessage('An email is required.'),
        check('password').notEmpty().trim().isLength( {min: 8, max: 10} ).withMessage('A password is required.'),
    ],
    usersControllers.loginUser
);

//Logoff user
router.post(
    '/logoff',
    [
        check('userId').notEmpty().trim().withMessage('An userId is required.'),
        check('tokenToRevoke').notEmpty().trim().withMessage('A token is required.'),
    ],
    usersControllers.logoffUser
);

module.exports = router;