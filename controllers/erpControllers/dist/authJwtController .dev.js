"use strict";

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var _require = require('lodash'),
    stubFalse = _require.stubFalse;

var mongoose = require('mongoose');

var Admin = mongoose.model('Admin');

require('dotenv').config({
  path: '.env'
});

exports.login = function _callee(req, res) {
  var _req$body, email, password, admin, isMatch, token, result;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, email = _req$body.email, password = _req$body.password; // validate

          if (!(!email || !password)) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            success: false,
            result: null,
            message: 'Not all fields have been entered.'
          }));

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(Admin.findOne({
            email: email,
            removed: false
          }));

        case 6:
          admin = _context.sent;

          if (admin) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            success: false,
            result: null,
            message: 'No account with this email has been registered.'
          }));

        case 9:
          _context.next = 11;
          return regeneratorRuntime.awrap(bcrypt.compare(password, admin.password));

        case 11:
          isMatch = _context.sent;

          if (isMatch) {
            _context.next = 14;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            success: false,
            result: null,
            message: 'Invalid credentials.'
          }));

        case 14:
          token = jwt.sign({
            id: admin._id
          }, process.env.JWT_SECRET, {
            expiresIn: req.body.remember ? 365 * 24 + 'h' : '24h'
          });
          _context.next = 17;
          return regeneratorRuntime.awrap(Admin.findOneAndUpdate({
            _id: admin._id
          }, {
            isLoggedIn: true
          }, {
            "new": true
          }).exec());

        case 17:
          result = _context.sent;
          res.status(200).cookie('token', token, {
            maxAge: req.body.remember ? 365 * 24 * 60 * 60 * 1000 : null,
            // Cookie expires after 30 days
            sameSite: 'Lax',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            domain: req.hostname,
            Path: '/'
          }).json({
            success: true,
            result: {
              token: token,
              admin: {
                id: result._id,
                name: result.name,
                isLoggedIn: result.isLoggedIn
              }
            },
            message: 'Successfully login admin'
          });
          _context.next = 24;
          break;

        case 21:
          _context.prev = 21;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            success: false,
            result: null,
            message: _context.t0.message,
            error: _context.t0
          });

        case 24:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 21]]);
};

exports.isValidAdminToken = function _callee2(req, res, next) {
  var token, verified, admin;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          token = req.cookies.token;

          if (token) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", res.status(401).json({
            success: false,
            result: null,
            message: 'No authentication token, authorization denied.',
            jwtExpired: true
          }));

        case 4:
          verified = jwt.verify(token, process.env.JWT_SECRET);

          if (verified) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", res.status(401).json({
            success: false,
            result: null,
            message: 'Token verification failed, authorization denied.',
            jwtExpired: true
          }));

        case 7:
          _context2.next = 9;
          return regeneratorRuntime.awrap(Admin.findOne({
            _id: verified.id,
            removed: false
          }));

        case 9:
          admin = _context2.sent;

          if (admin) {
            _context2.next = 14;
            break;
          }

          return _context2.abrupt("return", res.status(401).json({
            success: false,
            result: null,
            message: "Admin doens't Exist, authorization denied.",
            jwtExpired: true
          }));

        case 14:
          req.admin = admin;
          next();

        case 16:
          _context2.next = 21;
          break;

        case 18:
          _context2.prev = 18;
          _context2.t0 = _context2["catch"](0);
          res.status(503).json({
            success: false,
            result: null,
            message: _context2.t0.message,
            error: _context2.t0
          });

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 18]]);
};

exports.logout = function _callee3(req, res) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // const result = await Admin.findOneAndUpdate(
          //   { _id: req.admin._id },
          //   { isLoggedIn: false },
          //   {
          //     new: true,
          //   }
          // ).exec();
          res.clearCookie('token', {
            maxAge: null,
            // Cookie expires after 30 days
            sameSite: 'Lax',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            domain: req.hostname,
            Path: '/'
          }).json({
            isLoggedOut: true
          });

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
};