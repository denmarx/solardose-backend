const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const locationRoutes = require('./routes/location');
const SunCalc = require('suncalc');
const cron = require('node-cron');

const app = express();
app.use(bodyParser.json());

require('dotenv').config(); // Load environment variables from .env

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Use the routes
app.use('/api', locationRoutes); // All routes in location.js will be prefixed with /api

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


