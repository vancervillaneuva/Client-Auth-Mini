const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const User = require('./user.js');
const bcrypt = require('bcrypt');
const cors = require('cors');
//const morgan = require('morgan');

const STATUS_USER_ERROR = 422;
const BCRYPT_COST = 11;

const server = express();
// to enable parsing of json bodies for post requests
server.use(bodyParser.json());
server.use(session({
    secret: 'e5SPiqsEtjexkTj3Xqovsjzq8ovjfgVDFMfUzSmJO21dtXs4re'
}));

//server.use(morgan());

// Added CORS
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};
server.use(cors(corsOptions));

// /* Sends the given err, a string or an object, to the client. Sets the status
//  * code appropriately. */
const sendUserError = (err, res) => {
    res.status(STATUS_USER_ERROR);
    if (err && err.message) {
        res.json({ message: err.message, stack: err.stack });
    } else {
        res.json({ error: err });
    }
};

// EnsureLogin
const ensureLogin = (req, res, next) => {
    const { username } = req.session;
    if (!username) {
        sendUserError('must be logged in', res);
        return;
    }

    User.findOne({ username }, (err, user) => {
        if (err) {
            sendUserError(err, res);
            return;
        }

        if (!user) {
            sendUserError('must be logged in', res);
            return;
        }

        req.user = user;
        next();
    });
};


// Post /users
server.post('/users', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        sendUserError('username and password are required', res);
        return;
    }

    bcrypt.hash(password, BCRYPT_COST, (hashErr, newHash) => {
        if (hashErr) {
            sendUserError(hashErr, res);
            return;
        }

        const user = new User({
            username,
            passwordHash: newHash
        });

        user.save((err, newUser) => {
            if (err) {
                sendUserError(err, res);
                return;
            }
            res.json(newUser);
        });
    });
});


server.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
        sendUserError('username and pasword are required', res);
        return;
    }

    User.findOne( { username }, (err, user) => {
        if (err) {
            sendUserError(err, res);
            return;
        }

        if (!user) {
            sendUserError('bad credentials', res);
            return;
        }

        bcrypt.compare(password, user.passwordHash, (compareErr, valid) => {
            if (compareErr) {
                sendUserError(compareErr, res);
                return;
            }
        
            if (!valid) {
                sendUserError('bad credentials', res);
                return;
            }

            req.session.username = username; // at the top
            res.json({ success: true });
        });
    }); 
});



server.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});


server.get('/me', ensureLogin, (req, res) => {
  // Do NOT modify this route handler in any way.
    res.json(req.user);
});


// Restrict Acceess
const restrictAccess = (req, res, next) => {
    const path = req.path;
    if (/restricted/.test(path)) {
        if (!req.session.username) {
            sendUserError('Must be logged in to access', res);
            return;
        }
    }
    next();
};

server.use(restrictAccess);

server.get('/restricted/users', (req, res) => {
    User.find({})
	.exec()
	.then ((users) => {
    res.json(users);	
})
    .catch((err) => {
        sendUserError(err, res);
        return;
    });

});


module.exports = { server };

