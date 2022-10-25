const express = require('express');
const env = require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const App = express();

let api_port = process.env.api_port;

let create_db_contents = false;
if (!fs.existsSync('./users.db')){
    create_db_contents = true;
}

let Database = new sqlite3.Database('users.db', (err) => {
    if (err)
        console.log('There was error during loading/creating database! :(');
    else {
        if (create_db_contents){
            let sql = `
            CREATE TABLE users (
                id varchar(255),
                username varchar(56),
                password varchar(255),
                email varchar(1024)
            );
            `;

            Database.exec(sql, (err) => {
                console.log('Created new database!');
            });
        }

        console.log('Database finished loading/creating!');
    }
});

// Middlewares: 

// Routes: 
App.get('/',(req, res) => {
    res.send({
        'message' : 'Hello! From API.'
    });
});

// Listen
App.listen(api_port);