const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const config = require('./config/database');

// Connect to Database
mongoose.Promise = global.Promise;
mongoose.connect(config.database);


// On Connection
mongoose.connection.on('connected', () => {
    console.log('Connected to database ' + config.database);
});

// On Database error
mongoose.connection.on('error', (err) => {
    console.log('Database error: ' + err);
})

const app = express();

require("./models/auth");

const auth = require('./routes/auth');

//Port number local
const port = 5000;

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());


app.use('/api', auth);

app.get('/', (req, res) => {
    res.send('Invalid endpoint');
});

app.get('*', (req, res) => {
    req.sendFile(path.join(__dirname, 'public/index.html'));
})

// Start Server
app.listen(port, () => {
    console.log('Server started on port ' + port);
});