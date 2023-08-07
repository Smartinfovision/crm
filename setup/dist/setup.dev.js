"use strict";

require('dotenv').config({
  path: __dirname + '/../.env'
});

var mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

function createAdmin() {
  var Admin, newAdmin, passwordHash;
  return regeneratorRuntime.async(function createAdmin$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          Admin = require('../models/erpModels/Admin');
          newAdmin = new Admin();
          passwordHash = newAdmin.generateHash('smartinfo123');
          _context.next = 6;
          return regeneratorRuntime.awrap(new Admin({
            email: 'vaibhav@smartinfovision.com',
            password: passwordHash,
            name: 'vaibhav',
            surname: 'vaibhav'
          }).save());

        case 6:
          console.log('👍👍👍👍👍👍👍👍 Admin created : Done!');
          process.exit();
          _context.next = 15;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          console.log('\n👎👎👎👎👎👎👎👎 Error! The Error info is below');
          console.log(_context.t0);
          process.exit();

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
}

createAdmin();