var userRepository = require('../data-access-layer/user-repository')
var passwordHash = require('password-hash')
var jwt = require('jsonwebtoken')
var secret = "server-secret"


exports.getErrors = function(user, callback) {

    var errors = []

    if (!user.name) {
        errors.push("The Username is missing")
        callback(errors)
    } else if (user.pass1 != user.pass2) {
        errors.push("Passwords do not match!!")
        callback(errors)
    } else {
        userRepository.getByName(user, function(length) {

            if (length > 0) {
                errors.push("The Username already exists")

                callback(errors)
            }
        })
    }
    callback(errors)
}


exports.getLogErr = function(user, callback) {
    var errors = []
    userRepository.verifyUser(user, function(array) {

        if (array.length == 0) {
            errors.push("The Username does not exist, Please try again or Register!!")
            callback(errors)
        } else {
            if (!(passwordHash.verify(user.password, array[0].password))) {
                errors.push("Password Incorrect")
                callback(errors)
            }

        }
    })
    callback([])
}

exports.authUser = function(user, callback) {
    userRepository.logIn(user, function(authUser) {
        callback(authUser)
    })
}

exports.authRegUser = function(user, callback) {
    userRepository.register(user, function(array, authUser) {
        callback(authUser)
    })
}

exports.createToken = function(user, callback) {
    userRepository.logIn(user, function(authUser) {
        jwt.sign(authUser, secret, {}, function(error, tok) {
            var token = {
                token: tok
            }
            callback(token)
        })
    })
}
