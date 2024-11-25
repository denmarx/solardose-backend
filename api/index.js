const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const locationRoutes = require('./location');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// Use the routes
app.use('/api', locationRoutes); // All routes in location.js will be prefixed with /api

module.exports = app;
module.exports.handler = serverless(app);

// Local testing setup
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running locally on port ${PORT}`);
    });
}