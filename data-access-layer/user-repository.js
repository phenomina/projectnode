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
    //var checkquery = "SELECT username FROM users WHERE users.username= :name"
    var query = "INSERT INTO users (userName,password) VALUES (:name, :password)"
    var query3 = "SELECT userId FROM users WHERE users.username= :name"

    var values = {
        ":name": user.name,
        ":password": user.password
    }
    // db.all(checkquery, {
    //     ":name": user.name
    // }, function(error, row) {
    db.serialize(function() {
        db.run(query, values, function(error) {
            if (error) {
                console.log(error)
                callback(["databaseError"], null)
            } else {
                db.get(query3, {
                    ":name": user.name
                }, function(error, row3) {
                    var newUser = {
                        id: user.name,
                        password: user.password
                    };
                    db.run("INSERT INTO memberRoles VALUES (?,?)", row3.userId, 2)
                    db.run("INSERT INTO memberRoles VALUES (?,?)", row3.userId, 3)
                    var payload = newUser
                    jwt.sign(payload, secret, {}, function(error, token) {
                        console.log(token)
                    })

                    callback([], user)
                })
            }
        })
    })

}
