const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const doctorsRoutes = require('./routes/doctors-routes');
const HttpError = require('./models/http-error')

const app = express();

//used for POST Request
app.use(bodyParser.json());

app.use('/api/doctors', doctorsRoutes);

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
    .connect('mongodb+srv://fran:sQXpfhfBzWE2NtIG@clustervortex.6inedbo.mongodb.net/medical-related?retryWrites=true&w=majority')
    .then(() => {
        app.listen(5000);
    })
    .catch(err => {
        console.log(err);
    });