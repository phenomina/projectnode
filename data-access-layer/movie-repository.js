var db = require('./mydb')

exports.getAll = function(callback) {
    var query = "SELECT id,title,year FROM movies"
    db.all(query, function(error, movies) {
        if (error) {
            console.log(error)
            callback(["databaseError"], null)
        } else {
            callback([], movies)
        }
    })
}

exports.getById = function(id, callback, callback2) {
    var query = "SELECT title,year FROM movies WHERE movies.id = :id"
    var query2 = "SELECT rating FROM movies,ratings WHERE movies.id = ratings.movieId AND movies.id = :id GROUP BY ratings.rating"
    db.get(query, {
        ":id": id
    }, function(error, movie) {
        if (error) {
            console.log(error)
            callback(["databaseError"], null)
        } else {
            db.all(query2, {
                ":id": id
            }, function(error, rating) {
                if (error) {
                    console.log(error)
                    callback(["databaseError"], null)
                } else {
                    callback([], movie, rating)
                }
            })
        }
    })
}
