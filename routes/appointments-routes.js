const express = require('express');
const { check } = require('express-validator');
const appointmentsControllers = require('../controllers/appointments-controllers');
const authMiddleware = require('../middleware/auth-middleware');
const roleMiddleware = require('../middleware/role-middleware');
const paginationMiddleware = require('../middleware/pagination-middleware');
const router = express.Router();

//show patient's appointment
router.get('/patient/:userId', authMiddleware.authenticateUser, paginationMiddleware.handlePagination, appointmentsControllers.showPatientsAppointment);

//show patient's canceled appointment
router.get('/canceled/:userId', authMiddleware.authenticateUser, paginationMiddleware.handlePagination, appointmentsControllers.showPatientsCanceledAppointment);

//show doctor's appointment
router.get('/:id', authMiddleware.authenticateUser, roleMiddleware.checkAdminRole, paginationMiddleware.handlePagination, appointmentsControllers.showDoctorAppointments);

//create appointment
router.post(
    '/',
    authMiddleware.authenticateUser,
    roleMiddleware.checkAdminRole,
    [
        check('time.minutes').isIn(['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']).withMessage('A reasonable minute must be added.'),
        check('time.hour').isIn(['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']).withMessage('A reasonable hour must be added.'),
        check('date.day').isIn(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31']).withMessage('A reasonable day must be added.'),
        check('date.month').isIn(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']).withMessage('A reasonable month must be added.'),
        check('date.year').isIn(['2023', '2024', '2025', '2026']).withMessage('A reasonable year must be added.'),
        check('status').trim().toLowerCase().isIn(['taken','available']).withMessage('Only "taken" or "available" status accepted.'),
        check('doctorId').notEmpty().withMessage('A doctor id is required.').trim()
    ], 
    appointmentsControllers.createAppointment
);

//update appointment
router.patch(
    '/:id',
    authMiddleware.authenticateUser,
    roleMiddleware.checkAdminRole,
    [
        check('time.minutes').optional().isIn(['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']).withMessage('A reasonable minute must be added.'),
        check('time.hour').optional().isIn(['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']).withMessage('A reasonable hour must be added.'),
        check('date.day').optional().isIn(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31']).withMessage('A reasonable day must be added.'),
        check('date.month').optional().isIn(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']).withMessage('A reasonable month must be added.'),
        check('date.year').optional().isIn(['2023', '2024', '2025', '2026']).withMessage('A reasonable year must be added.'),
        check('status').optional().trim().toLowerCase().isIn(['taken','available']).withMessage('Only "taken" or "available" status accepted.'),
        check('doctorId').optional().notEmpty().withMessage('A doctor id is required.').trim()
    ], 
    appointmentsControllers.updateAppointmentById
);

//arrange appointment
router.patch(
    '/setTaken/:id',
    authMiddleware.authenticateUser,
    roleMiddleware.checkPatientRole,
    appointmentsControllers.arrangeAppointment
);

//disarrange appointment
router.patch(
    '/setAvailable/:id',
    authMiddleware.authenticateUser,
    roleMiddleware.checkPatientRole,
    appointmentsControllers.disarrangeAppointment
);

//delete appointment
router.delete('/:id', authMiddleware.authenticateUser, roleMiddleware.checkAdminRole, appointmentsControllers.deleteAppointmentById);

module.exports = router;