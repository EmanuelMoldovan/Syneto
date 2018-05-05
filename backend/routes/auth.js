const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/auth');
const config = require('../config/database')
const passport = require('../config/passport')

// This in a test API to see if authorization is working
router.get('/try', passport, (req, res) => {
    jwt.verify(req.token, config.secret, (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
            res.json({
                message: 'Post created...',
                authData
            })  
        }
    })  
})

// Register
router.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        confirmed: false
    });

    User.addUser(newUser, (err, user) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to register user' });
        } else {
            res.json({ success: true, msg: 'User registered', id: user._id });
        }
    });
});

router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if (err) {
            throw err;
        }

        if (!user) {
            return res.json({ success: false, msg: 'User not found' });
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) {
                throw err;
            }

            if (isMatch) {
                jwt.sign({user}, config.secret, {  expiresIn: '10h' }, (err, token) => {
                    res.json({
                        success: true,
                        token: 'Bearer ' + token,
                        user: {
                            id: user._id,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                            confirmed: user.confirmed
                        }
                    })
                })                
            } else {
                return res.json({ success: false, msg: 'Wrong password' });
            }
        })
    })
});

module.exports = router;