var userValidator = require('./user-validator')
var userRepository = require('../data-access-layer/user-repository')


exports.register = function(user, callback) {

    var errors = userValidator.getErrors(user)

    if (0 < errors.length) {

        callback(errors, user, null)
    } else {

        userRepository.register(user, callback)
    }

}
