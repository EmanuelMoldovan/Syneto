const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

// Email confirmation API
router.get('/confirm/:token', (req, res) => {
    jwt.verify(req.params.token, config.secret, (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
            if(authData.user.confirmed === false){
                authData.user.confirmed = true;
                User.updateUser(authData.user, (err, user) => {
                    if (err) {
                        res.json({ success: false, msg: 'Email confirmation failed' });
                    } else {
                        res.json({ success: true, msg: 'Email confirmed', id: user._id });
                    }
                });
            } else{
                res.json({ success: false, msg: 'Email allready confirmed', id: user._id });
            }          
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

    User.getUserByUsername(newUser.username, (err, user) => {
        if (err) {
            throw err;
        }

        // Verify if username exist
        if (user) {
            return res.json({ success: false, msg: 'Username allready exist in our system' });
        } else{
            User.addUser(newUser, (err, user) => {
                if (err) {
                    res.json({ success: false, msg: 'Failed to register user' });
                } else {
                    jwt.sign({user}, config.secret, {  expiresIn: '10h' }, (err, token) => {
                        let resultToken = token;

                        const output = `
                        <h1>Syneto CALCULATOR</h1>
                        </br>
                        <p>Please confirm your email by clicking the link bellow</p>
                        </br>
                        <p>http://localhost:5000/api/confirm/${resultToken}</p>
                    `;
    
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.mail.yahoo.com',
                        port: 465,
                        secure: true, // use SSL
                        auth: {
                            user: 'synetocalculator@yahoo.com',
                            pass: 'zxcasdqwe123!@#'
                        }
                    });
    
                    // setup email data with unicode symbols
                    let mailOptions = {
                        from: '"SYNETO Calculator" <synetocalculator@yahoo.com>', // sender address
                        to: req.body.email, // list of receivers
                        subject: 'Confirmation email', // Subject line
                        text: 'Hello world?', // plain text body
                        html: output // html body
                    };
    
                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        res.json({ success: true, msg: 'E-mail sent'});
                    }); 
                               
                    })                                    
                }
            });            
        }
    })      
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

        // Verify if password match
        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) {
                throw err;
            }

            if (isMatch) {
                if(user.confirmed == true){
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
                }else{
                    return res.json({ success: false, msg: 'Please confirm your account' });
                }
                              
            } else {
                return res.json({ success: false, msg: 'Wrong password' });
            }
        })
    })
});

router.get('/users', passport, (req, res) => {
    jwt.verify(req.token, config.secret, (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
            User.getAllUsers(authData.user._id, (err, user) => {
                if (err) {
                    res.json({ success: false, msg: 'User not found' });
                } else {
                    res.json({ success: true, user });
                }
            }); 
        }
    })  
})

router.put('/ban', passport, (req, res) => {
    jwt.verify(req.token, config.secret, (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
            if(authData.user.role == 0){
                req.body.banned = true;
                User.updateUser(req.body, (err, user) => {
                    if (err) {
                        res.json({ success: false, msg: 'User not found' });
                    } else {
                        res.json({ success: true,  msg: 'User was banned' });
                    }
                });
            }             
        }
    }) 
})

module.exports = router;