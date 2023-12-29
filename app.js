const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const usersRoutes = require('./routes/users-routes');
const doctorsRoutes = require('./routes/doctors-routes');
const specialitiesRoutes = require('./routes/specialities-routes');
const appointmentRoutes = require('./routes/appointments-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(cors());

//used for POST Request
app.use(bodyParser.json());

app.use('/api/users', usersRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/specialities', specialitiesRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use((req, res, next) => {
    return next(
        new HttpError('Could not find this route.', 404)
    );
});

//Middleware for handling errors
app.use((error, req, res, next) => {
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error ocurred'});
})

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(process.env.PORT);
    })
    .catch(err => {
        return next(
            new HttpError('Something went wrong with mongoose connection.', 500),
            err
        )
    });