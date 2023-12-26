const express = require('express');
const usersControllers = require('../controllers/users-controllers');
const router = express.Router();

//Register user
router.post('/register', usersControllers.registerUser);

//Login user
router.post('/login', usersControllers.loginUser);

//Logoff user
router.post('/logoff', usersControllers.logoffUser);

module.exports = router;