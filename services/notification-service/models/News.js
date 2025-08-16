// notification-service/models/News.js
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  url: { type: String },
  source: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', newsSchema);
