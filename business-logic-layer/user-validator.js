var userRepository = require('../data-access-layer/user-repository')


exports.getErrors = function(user) {

    var errors = []

    if (!user.name) {
        errors.push("The Username is missing")
    } else {
        userRepository.getByName(user, function(length) {
            console.log(length)
            if (length > 0) {
                errors.push("The Username already exists")
            }
        })


    }

    return errors

}
