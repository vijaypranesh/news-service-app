// notification-service/models/News.js
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: String,
  summary: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', newsSchema);
