const express = require('express');
const env = require('dotenv').config();
const App = express();

let api_port = process.env.api_port;

// Middlewares: 

// Routes: 
App.get('/',(req, res) => {
    res.send({
        'message' : 'Hello! From API.'
    });
});

// Listen
App.listen(api_port);