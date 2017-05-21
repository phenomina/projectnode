var userValidator = require('./user-validator')
var userRepository = require('../data-access-layer/user-repository')


exports.register = function(user, callback) {

    userValidator.getErrors(user, function(errors) {

        if (0 < errors.length) {

            callback(errors, user, null)

        } else {

            userValidator.authRegUser(user, function(authUser) {

                callback([], user, authUser)


            })
        }
    })
}


exports.logIn = function(user, callback) {

    userValidator.getLogErr(user, function(errors) {

        if (0 < errors.length) {

            callback(errors, user, null, null)
        } else {
            userValidator.authUser(user, function(authUser) {


                userValidator.createToken(user, function(token) {
                    callback([], user, authUser, token)
                })
            })
        }
    })
}

exports.deleteRating = function(movieId, callback) {
    userRepository.deleteRating(movieId, callback)
}

exports.delUserRate = function(movieDetails, callback) {
    userRepository.delUserRate(movieDetails, callback)
}

exports.getAll = function(callback) {
    userRepository.getAll(callback)
}

exports.getUsers = function(callback) {
    userRepository.getUsers(callback)
}

exports.getById = function(id, callback) {
    userRepository.getById(id, callback)
}

exports.getAccount = function(user, callback) {
    userRepository.getAccount(user, callback)
}

exports.getUserRole = function(callback) {
    userRepository.getUserRole(callback)
}

exports.delUserRole = function(movieDetails, callback) {
    userRepository.delUserRole(movieDetails, callback)
}
exports.getProfile = function(username, callback) {
    userRepository.getProfile(username, callback)
}

exports.updateProfile = function(userDet, callback) {
    userRepository.updateProfile(userDet, callback)
}
exports.addFriend = function(friendData, callback) {
    userRepository.addFriend(friendData, callback)
}

exports.getFriends = function(user, callback) {
    userRepository.getFriends(user, callback)
}

exports.checkFriends = function(fId, callback) {
    userRepository.checkFriends(fId, callback)
}
exports.createFoaF = function(user, callback) {
    userRepository.createFoaF(user, callback)
}
