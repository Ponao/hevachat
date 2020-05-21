/**
 * database.js
 * Author: Roman Shuvalov
 */
'use strict';

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/hevachat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports = mongoose;