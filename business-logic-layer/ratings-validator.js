var ratingRepository = require('../data-access-layer/ratings-repository')
var passwordHash = require('password-hash')
var minRate = 0
var maxRate = 10



exports.getErrors = function(movieRate, callback) {

    var errors = []

    if (!movieRate.title || !movieRate.year || movieRate.rating == null) {
        errors.push("Please fill in all fields first")
        callback(errors)
    } else if (movieRate.rating < 0 || movieRate.rating > 10) {
        errors.push("Invalid rating, please use a scale of 0 to 10")
        callback(errors)
    } else {
        ratingRepository.getMovie(movieRate, function(length) {
            console.log("This in manager" + length)
            if (length > 0) {
                errors.push("You have already rated this Movie")
                callback(errors)
            } else {
                callback(errors)
            }
        })
    }
}


exports.movieId = function(movieRate, callback) {
    ratingRepository.insertRate(movieRate, function(movieId) {
        callback(movieId)
    })
}
