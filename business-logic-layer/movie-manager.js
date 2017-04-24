var movieRepository = require('../data-access-layer/movie-repository')



exports.getAll = function(callback) {
    movieRepository.getAll(callback)
}

exports.getById = function(id, callback) {
    movieRepository.getById(id, callback)
}
