var ratingValidator = require('./ratings-validator')
var ratingRepository = require('../data-access-layer/ratings-repository')


exports.pushNewRate = function(movieRate, callback) {

    ratingValidator.getErrors(movieRate, function(errors) {

        if (0 < errors.length) {

            callback(errors, null)

        } else {

            ratingValidator.movieId(movieRate, function(movieId) {

                callback([], movieId)


            })


        }
    })
}

exports.getUserName = function(uId, callback) {
    ratingRepository.getUserName(uId, callback)
}

exports.checkRate = function(movieDetails, callback) {
    ratingRepository.checkRate(movieDetails, callback)
}
