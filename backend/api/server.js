// MAIN API

const express = require('express');
const cookieparser = require("cookie-parser");
const sessions = require('express-session');
const App = express();

const env = require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();

const fs = require('fs');

const error_codes = require('./error_codes');

let api_port = process.env.api_port;

let create_db_contents = false;
if (!fs.existsSync('./users.db')){
    create_db_contents = true;
}

let Database = new sqlite3.Database('users.db', (err) => {
    if (err)
    {
        console.log('There was error during loading/creating database!');
        return;
    } else {
        if (create_db_contents){
            let sql = `
            CREATE TABLE users (
                id int NOT NULL AUTO_INCREMENT,
                username varchar(56),
                password varchar(255),
                email varchar(1024)
            );
            `;

            Database.exec(sql, (err) => {
                if (err){
                    console.log("There was an error whilist creating new database!");
                    return
                }
                console.log('Created new database!');
            });
        }

        console.log('Database finished loading/creating!');
    }
});

// Constants:
const one_day = 1000 * 60 * 60 * 24;

// Middlewares: 
App.use(express.json());
App.use(express.urlencoded({ extended: true }));
App.use(sessions({
    secret: process.env.cookie_key,
    saveUninitialized : true,
    cookie: { maxAge: one_day },
    resave: false
}));
App.use(cookieparser());

// Check for the special api key.
function SpecialApiKeyCheck(body){
    if (!body.key) return false;

    let key = body.key;

    if (key == process.env.api_key_private){
        return 1;
    } else if (key == process.env.api_key_public){
        return 2;
    }
}

function SpecialApiKeyCheckGet(query){
    if (!query.key) return false;

    let key = query.key;


    if (key == process.env.api_key_private) return 1;
    else if (key == process.env.api_key_public) return 2;
    else return -1;
}

// Routes: 
App.post('/',(req, res) => {
    let key_presence = SpecialApiKeyCheck(req.body);

    if (!key_presence){
        res.status = 403; // FORBIDDEN
        res.sendFile(__dirname + '\\statuses\\forbidden.html');

        return -1;
    }

    res.sendFile(__dirname + '\\statuses\\api_welcome_message.html');
});

App.get('/user_session', (req, res) => {
    let session = req.session;

    let key_presence = SpecialApiKeyCheckGet(req.query);

    if (!key_presence){
        res.status = 403; // FORBIDDEN
        res.sendFile(__dirname + '\\statuses\\403.html');

        return -1;
    }

    res.send(session);
});

App.post('/create_user', (req, res) => {
    let session = req.session;

    let key_presence = SpecialApiKeyCheck(req.body);

    if (!key_presence){
        res.status = 403; // FORBIDDEN
        res.sendFile(__dirname + '\\statuses\\403.html');

        return -1;
    }

    // console.log(req.body);

    if (!req.body.login || !req.body.password || !req.body.email){
        res.status = 400; // BAD REQUEST
        res.sendFile(__dirname + '\\statuses\\400.html');

        return -1;
    }

    const login = req.body.login;
    const password = req.body.password;
    const email = req.body.email;

    // Do checks if login or passwords are correct, not sql injection attempts.
    // TODO

    // check if user already exists in database
    Database.all(`SELECT * FROM users WHERE username="${login}" OR email="${email}"`, (err, rows) => {
        if (err){
            console.log("There was error during checking for user in database!");
            res.send({
                error_code : error_codes.ERROR.DATABASE_FAILED,
                details : error_codes.ERROR.FETCH_ERROR
            });
            return true;
        }
        if (rows.length != 0) {
            res.send({
                error_code : error_codes.ERROR.USER_ALREADY_EXISTS,
                details : error_codes.ERROR.NO_DETAILS
            });
            return true;
        }

        return false;
    });

    // Append data to database
    const DatabaseAddUser = async() => {
        Database.exec(`INSERT INTO users (username, password, email) VALUES ("${login}", "${password}", "${email}");`, (err) => {
            if (err){
                // console.log('Account creation failed!');
                res.send({
                    error_code : error_codes.ERROR.DATABASE_FAILED,
                    details : error_codes.ERROR.FETCH_ERROR
                });
                return true;
            }
            return false;
        }
    )};
    
    result = DatabaseAddUser();
    
    if (result) return -1;

    // Set sessions for user
    req.session.login = login;
    req.session.loggedin = true;

    res.send({
        "error_code" :  error_codes.ERROR.NO_ERROR
    })
});

// Listen
App.listen(api_port);