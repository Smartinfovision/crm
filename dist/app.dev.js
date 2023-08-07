"use strict";

var express = require('express');

var helmet = require('helmet');

var path = require('path');

var cors = require('cors');

var cookieParser = require('cookie-parser');

require('dotenv').config({
  path: '.env'
});

var helpers = require('./helpers');

var erpApiRouter = require('./routes/erpRoutes/erpApi');

var erpAuthRouter = require('./routes/erpRoutes/erpAuth');

var erpDownloadRouter = require('./routes/erpRoutes/erpDownloadRouter');

var errorHandlers = require('./handlers/errorHandlers');

var _require = require('./controllers/erpControllers/authJwtController'),
    isValidAdminToken = _require.isValidAdminToken; // Create our Express app


var app = express(); // Middleware

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express["static"](path.join(__dirname, 'public'))); // Pass variables to our templates + all requests

app.use(function (req, res, next) {
  res.locals.h = helpers;
  res.locals.admin = req.admin || null;
  res.locals.currentPath = req.path;
  next();
}); // CORS configuration

var corsOptions = {
  origin: true,
  credentials: true
}; // Here are our API Routes

app.use('/api', cors(corsOptions), erpAuthRouter);
app.use('/api', cors(corsOptions), isValidAdminToken, erpApiRouter);
app.use('/download', cors(corsOptions), erpDownloadRouter); // If the above routes didn't work, we 404 them and forward to the error handler

app.use(errorHandlers.notFound); // Development error handler - Prints stack trace

if (app.get('env') === 'development') {
  app.use(errorHandlers.developmentErrors);
} // Production error handler


app.use(errorHandlers.productionErrors); // Done! We export it so we can start the site in start.js

module.exports = app;