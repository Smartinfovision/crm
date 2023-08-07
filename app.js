const express = require('express');
const helmet = require('helmet');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: '.env' });
const helpers = require('./helpers');
const erpApiRouter = require('./routes/erpRoutes/erpApi');
const erpAuthRouter = require('./routes/erpRoutes/erpAuth');
const erpDownloadRouter = require('./routes/erpRoutes/erpDownloadRouter');
const errorHandlers = require('./handlers/errorHandlers');
const { isValidAdminToken } = require('./controllers/erpControllers/authJwtController');

// Create our Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Pass variables to our templates + all requests
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.admin = req.admin || null;
  res.locals.currentPath = req.path;
  next();
});

// CORS configuration
const corsOptions = {
  origin: true,
  credentials: true,
};

// Here are our API Routes
app.use('/api', cors(corsOptions), erpAuthRouter);
app.use('/api', cors(corsOptions), isValidAdminToken, erpApiRouter);
app.use('/download', cors(corsOptions), erpDownloadRouter);

// If the above routes didn't work, we 404 them and forward to the error handler
app.use(errorHandlers.notFound);

// Development error handler - Prints stack trace
if (app.get('env') === 'development') {
  app.use(errorHandlers.developmentErrors);
}

// Production error handler
app.use(errorHandlers.productionErrors);

// Done! We export it so we can start the site in start.js
module.exports = app;
