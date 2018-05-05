const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const config = require('../config/database');

// User Schema
const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        required: false
    },
    confirmed: {
        type: Boolean,
        require: false
    }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback) {
    User.findById(id)
        .exec(callback);
};

module.exports.getUserByUsername = function(username, callback) {
    const query = { username: username };
    User.findOne(query)
        .exec(callback);
};

module.exports.addUser = function(newUser, callback) {
    bcrypt.genSalt(newUser.bcryptIterations, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
                throw err;
            }
            newUser.password = hash;
            newUser.save(callback);
        })
    })
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) {
            throw err;
        }

        callback(null, isMatch);
    })
};

module.exports.updateUser = function(user, callback) {
    if (user.body.password) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.body.password, salt, (err, hash) => {
                if (err) {
                    throw err;
                }
                user.body.password = hash;
                User.update({ _id: user.params.user_id }, user.body, callback);
            })
        })
    } else {
        User.update({ _id: user.params.user_id }, user.body, callback);
    }
};

module.exports.getAllUsers = function(userId, callback) {
    User.findById(userId, (err, user) => {
        if (err) {
            throw err;
        }

        if (!user) {
            return false;
        } else if (user._doc.rol == 0) {
            User.find({})
                .exec(callback);        
        } else if (user._doc.rol == 1) {
            User.find({ _id: user._doc._id }, callback)
        }

    })
};

module.exports.deleteUser = function(userId, callback) {
    User.remove({ _id: userId }, callback);
}