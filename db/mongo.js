// Require dependencies
const mongoose = require('mongoose');

// Require configurations
const config = require('../config/mongo');

// Connect to MongoDB database
mongoose.connect(config.dbUri);
const db = mongoose.connection;

//
const analysisSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.Number,
    unique: true,
  },
  analytics: mongoose.Schema.Types.Mixed,
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Create an Analysis schema
const Analysis = db.model('Analysis', analysisSchema);

module.exports = {
  db,
  Analysis,
};
