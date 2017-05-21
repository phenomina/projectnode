var db = require('./mydb')
var passwordHash = require('password-hash')
var jwt = require('jsonwebtoken')
var secret = "server-secret"
var N3 = require('n3')

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
                    // db.run("INSERT INTO memberRoles VALUES (?,?)", row3.userId, 3)

                    db.get(query4, {
                        ":name": user.name
                    }, function(error, rowId) {
                        if (rowId) {

                            db.get("SELECT roleName FROM roles, memberRoles WHERE roles.id = memberRoles.roleId and memberRoles.memberId=?", rowId.userId, function(error, role) {
                                var newUser = {
                                    userId: row3.userId,
                                    name: user.name,
                                    role: role.roleName
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
    var query1 = "SELECT userId,fName,lName,gender,status FROM users WHERE users.userId= :id"
    var query = "SELECT id,title,rating FROM movies,ratings WHERE movies.id = ratings.movieId AND ratings.userId = :id"
    db.all(query, {
        ":id": id
    }, function(error, user) {
        if (error) {
            console.log(error)
            callback(["databaseError"], null, null)
        } else {

            db.get(query1, {
                ":id": id
            }, function(err, profile) {



                callback([], user, profile)
            })
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

exports.getUserRole = function(callback) {
    var query = "SELECT users.userId AS userID,userName,roleName FROM users,memberRoles,roles WHERE users.userId = memberRoles.memberId AND roles.id = memberRoles.roleId"
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


exports.delUserRole = function(userDetails, callback) {

    db.get("SELECT id FROM roles WHERE roleName=?", userDetails.role, function(err, row1) {
        if (err) {
            callback(["databaseError"])
        } else {
            console.log(row1.id);
            db.run("UPDATE memberRoles SET roleId =? WHERE memberId =?", row1.id, userDetails.userId)
            callback([])
        }
    })

}

exports.getProfile = function(username, callback) {

    db.get("SELECT * FROM users WHERE userName=?", username.name, function(err, row) {
        if (err) {
            callback(["databaseError"], null)
        } else {
            callback([], row)
        }
    })
}

exports.updateProfile = function(userDet, callback) {
    db.get("SELECT userId from users WHERE username=?", userDet.name, function(err, userID) {
        db.run("UPDATE users SET fName =?,lName=?,gender=?,status=? WHERE userId=?", userDet.fname, userDet.lname, userDet.gender, userDet.status, userID.userId)
        db.get("SELECT * FROM users WHERE userName=?", userDet.name, function(err, row) {
            if (err) {
                callback(["databaseError"], null)
            } else {
                callback([], row)
            }
        })
    })
}


exports.addFriend = function(friendData, callback) {
    db.get("SELECT userId from users WHERE username=?", friendData.username, function(err, row) {
        if (err) {
            callback(["databaseError"])
        } else {
            db.run("INSERT INTO friends (userID,friendID) VALUES (?,?)", row.userId, friendData.friendID)
            callback([])
        }

    })
}

exports.getFriends = function(user, callback) {
    db.get("SELECT userId from users WHERE username=?", user.name, function(err, row1) {
        if (err) {
            callback(["databaseError"])
        } else {

            db.all("SELECT fname FROM friends INNER JOIN users ON friends.friendID = users.userId WHERE friends.userID =?", row1.userId, function(err, row2) {
                if (err) {
                    callback(["databaseError"], null, null)

                } else {
                    db.all("SELECT fname FROM friends INNER JOIN users ON friends.userID = users.userId WHERE friends.friendID =?", row1.userId, function(err, row3) {

                        callback([], row2, row3)

                    })

                }

            })

        }

    })
}


exports.checkFriends = function(fId, callback) {
    console.log(fId);
    db.get("SELECT friendID FROM friends WHERE friendID=? and userID=?", fId.id, fId.user, function(err, row) {
        if (err) {
            callback(["databaseError"])
        } else {
            callback([], row)
        }
    })
}

exports.createFoaF = function(user, callback) {

    db.all("SELECT friendID FROM friends INNER JOIN users ON friends.friendID = users.userId WHERE friends.userID =?", user.id, function(err, row) {
        db.get("SELECT fName,lName FROM users where userId=?", user.id, function(err, user) {
            // Create a writer which we can use to write our profile.
            var writer = N3.Writer({
                prefixes: {
                    foaf: 'http://xmlns.com/foaf/0.1/'
                }
            })

            writer.addTriple({
                subject: 'http://localhost:8000/users/' + user.id,
                predicate: 'foaf:name',
                object: user.fName + " " + user.lName
            })

            for (var i = 0; i < row.length; i++) {

                // Add a triple to the profile using three arguments like this:
                writer.addTriple('http://localhost:8000/users/' + user.id,
                    'foaf:knows',
                    'http://localhost:8000/users/' + row[i].friendID)

            }
            // Get the profile from the writer.
            writer.end(function(error, profile) {
                console.log(profile)
                /* profile = `
                @prefix foaf: <http://xmlns.com/foaf/0.1/>.

                <http://heros.com/superman> foaf:knows <http://heros.com/batman>.
                <http://heros.com/batman> foaf:name "Bruce Wayne".
                `*/
                callback(profile)
            })
        })
    })


}
