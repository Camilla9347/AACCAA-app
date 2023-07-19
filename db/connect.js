const mongoose = require('mongoose');

// supress DeprecationWarning (strictQuery option)
mongoose.set('strictQuery', true);

const connectDB = (url) => {
  return mongoose.connect(url);
};

module.exports = connectDB;
