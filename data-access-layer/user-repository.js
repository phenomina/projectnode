var db = require('./mydb')
var passwordHash = require('password-hash')
var jwt = require('jsonwebtoken')
var secret = "server-secret"

exports.getByName = function(user, callback) {

    var checkquery = "SELECT username FROM users WHERE users.username= :name"
    db.all(checkquery, {
        ":name": user.name
    }, function(error, row) {
        if (error) {
            console.log(error)
        } else {
            callback(row.length)
        }
    })

}


exports.register = function(user, callback) {

    var query = "INSERT INTO users (userName,password) VALUES (:name, :password)"
    var query3 = "SELECT userId FROM users WHERE users.username= :name"
    var query4 = "SELECT userId FROM users WHERE users.username= :name"

    var values = {
        ":name": user.name,
        ":password": user.password
    }

    db.serialize(function() {
        db.run(query, values, function(error) {
            if (error) {

                callback(["databaseError"], null)
            } else {
                db.get(query3, {
                    ":name": user.name
                }, function(error, row3) {

                    db.run("INSERT INTO memberRoles VALUES (?,?)", row3.userId, 2)
                    db.run("INSERT INTO memberRoles VALUES (?,?)", row3.userId, 3)

                    db.get(query4, {
                        ":name": user.name
                    }, function(error, rowId) {
                        if (rowId) {

                            db.all("SELECT roleName FROM roles, memberRoles WHERE roles.id = memberRoles.roleId and memberRoles.memberId=?", rowId.userId, function(error, role) {
                                var newUser = {
                                    name: user.name,
                                    role: role[0].roleName
                                }


                                callback([], newUser)
                            })
                        }
                    })


                })
            }
        })
    })

}

exports.verifyUser = function(user, callback) {
    var query = "SELECT userId,username,password FROM users WHERE users.username= :name"

    db.all(query, {
        ":name": user.name
    }, function(error, row) {
        if (error) {

            callback(["databaseError"], null)
        } else {
            callback(row)
        }
    })
}


exports.logIn = function(user, callback) {
    var query = "SELECT userId FROM users WHERE users.username= :name"
    db.get(query, {
        ":name": user.name
    }, function(error, rowId) {
        if (rowId) {

            db.all("SELECT roleName FROM roles, memberRoles WHERE roles.id = memberRoles.roleId and memberRoles.memberId=?", rowId.userId, function(error, role) {
                var newUser = {
                    userId: rowId.userId,
                    name: user.name,
                    role: role[0].roleName
                }
                callback(newUser)
            })
        }
    })

}




exports.getAll = function(callback) {
    var query = "SELECT userId,userName FROM users"
    db.all(query, function(error, users) {
        if (error) {
            console.log(error)
            callback(["databaseError"], null)
        } else {
            callback([], users)
        }
    })
}


exports.getById = function(id, callback) {
    var query = "SELECT id,title,rating FROM movies,ratings WHERE movies.id = ratings.movieId AND ratings.userId = :id"
    db.all(query, {
        ":id": id
    }, function(error, user) {
        if (error) {
            console.log(error)
            callback(["databaseError"], null)
        } else {

            callback([], user)
        }
    })
}

exports.getAccount = function(user, callback) {
    var query = "SELECT id,title,rating FROM movies,ratings,users WHERE movies.id = ratings.movieId AND users.userId = ratings.userId AND users.userName =:name"
    db.all(query, {
        ":name": user.name
    }, function(error, row) {
        if (error) {

            callback(["databaseError"], null)
        } else {
            callback([], row)
        }
    })
}

exports.deleteRating = function(movieId, callback) {

    db.get("SELECT userId FROM users WHERE userName=:name", {
        ":name": movieId.name
    }, function(err, row) {
        if (err) {

            callback(["databaseError"])
        } else {
            db.run("DELETE FROM ratings WHERE ratings.movieId=? AND ratings.userId=?", movieId.id, row.userId)

            db.all("SELECT movieId FROM ratings WHERE ratings.movieId=?", movieId.id, function(err, row1) {

                if (row1.length == 0) {

                    db.run("DELETE FROM movies WHERE movies.id=?", movieId.id)

                }

            })
            callback([])
        }
    })
}

exports.getUsers = function(callback) {
    var query = "SELECT id,title,rating,userName,users.userId AS userID FROM movies,ratings,users WHERE movies.id = ratings.movieId AND users.userId = ratings.userId"
    db.all(query, function(error, users) {
        if (error) {
            console.log(error)
            callback(["databaseError"], null)
        } else {
            callback([], users)
        }
    })
}



exports.delUserRate = function(movieDetails, callback) {
    db.run("DELETE FROM ratings WHERE ratings.movieId=? AND ratings.userId=?", movieDetails.movieId, movieDetails.userId)

    db.all("SELECT movieId FROM ratings WHERE ratings.movieId=?", movieDetails.movieId, function(err, row1) {
        if (err) {
            callback(["databaseError"])
        } else {
            if (row1.length == 0) {
                db.run("DELETE FROM movies WHERE movies.id=?", movieDetails.movieId)
            }
        }
    })
    callback([])
}
