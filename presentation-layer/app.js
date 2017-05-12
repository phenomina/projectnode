var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var session = require('express-session')
var passwordHash = require('password-hash')
var jwt = require('jsonwebtoken')
var secret = "server-secret"
var movieManager = require('../business-logic-layer/movie-manager')
var userManager = require('../business-logic-layer/user-manager')
var ratingManager = require('../business-logic-layer/ratings-manager')

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: "my-salt"
}))



app.use(function(request, response, next) {
    response.locals.session = request.session.newUser
    next()
})

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json());

/*.......GET START PAGE.............*/

app.set("view engine", "hbs");
app.set('views', 'presentation-layer/views')



//////////////////////////////////CONTROLLERS START HERE///////////////////////////////

/*.......Get Home Page.............*/
app.get("/", function(request, response) {
    response.render('index.hbs', {

    })
})


/*.......GET ABOUT PAGE.............*/

app.get("/about.hbs", function(request, response) {
    response.render('about.hbs', {
        bite: request.session.user
    })
})


/*.......GET MOVIES PAGE.............*/
app.get('/movies.hbs', function(request, response) {
    movieManager.getAll(function(errors, movies) {
        if (0 < errors.length) {
            response.status(500).send('something is wrong')

        } else {
            response.render('movies', {
                movies: movies
            })
        }
    })
})

/*.......GET EACH MOVIE GIVEN PAGE.............*/

app.get('/movies/:id', function(request, response) {
    var id = parseInt(request.params.id)
    movieManager.getById(id, function(errors, movie, rating) {
        if (0 < errors.length) {
            response.status(500).send('something is wrong')

        } else {
            response.render('movie', {
                movie: movie,
                rating: rating
            })
        }
    })
})


//................GET ALL USERS..................
app.get("/users.hbs", function(request, response) {


    userManager.getAll(function(errors, users) {
        if (0 < errors.length) {
            response.status(500).send('something is wrong')

        } else {
            response.render('users', {
                users: users
            })
        }
    })

})
//......................................................................................................................................................
//.................................................GET EACH USER DETAIL..................................................
//......................................................................................................................................................

app.get("/users/:userId", function(request, response) {
    var id = parseInt(request.params.userId)

    userManager.getById(id, function(errors, user) {
        if (0 < errors.length) {
            response.status(500).send('something is wrong')

        } else {
            response.render('user', {
                user: user
            })
        }
    })


})

/*.......GET USER ACCOUNT DETAILS.............*/

app.get("/user_account.hbs", function(request, response) {

    var user = {
        name: request.session.newUser.name
    }

    userManager.getAccount(user, function(errors, row) {
        if (0 < errors.length) {
            response.status(500).send('something is wrong')

        } else {
            response.render('user_account', {
                user: row
            })
        }
    })

})

/*.......GET ADMIN ACCOUNT DETAILS.............*/
app.get("/admin_main.hbs", function(request, response) {
    if (request.session.newUser.role != "admin") {
        response.status(401).send("Really Dude!! You know you have no access!!")
    } else {
        response.render('admin_main.hbs', {

        })
    }
})

// GET ADMIN MANAGE RATINGS PAGE/////////////

app.get("/manage_ratings.hbs", function(request, response) {

    userManager.getUsers(function(errors, users) {
        if (0 < errors.length) {
            response.status(500).send('something is wrong')

        } else {
            response.render('manage_ratings', {
                user: users
            })
        }
    })

})

/*.......DELETE USER RATING.............*/

app.post("/movies/:id", function(request, response) {
    var movieId = {
        id: parseInt(request.params.id),
        name: request.session.newUser.name
    }

    userManager.deleteRating(movieId, function(errors) {
        if (0 < errors.length) {
            response.status(500).send('something is wrong')
        } else {
            response.redirect('/user_account.hbs')
        }
    })

})

/*.......ADMIN DELETE RATING.............*/

app.post("/delete_rating", function(request, response) {
    var movieDetails = {
        userId: request.body.userID,
        movieId: request.body.movieID
    }

    userManager.delUserRate(movieDetails, function(errors) {
        if (0 < errors.length) {
            response.status(500).send('something is wrong')
        } else {
            response.redirect('/manage_ratings.hbs')
        }
    })

})




//.............RATE MOVIE...................

app.get("/rating.hbs", function(request, response) {
    response.render('rating.hbs', {
        bite: request.session.user
    })
})

app.post("/rating", function(request, response) {

    var movieRate = {
        title: request.body.title,
        year: request.body.year,
        rating: request.body.newRate,
        user: request.session.newUser.name
    }

    ratingManager.pushNewRate(movieRate, function(errors, newMovie) {
        if (0 < errors.length) {
            response.render('rating', {

                errors: errors
            })
        } else {

            response.redirect("/movies/" + newMovie)
        }
    })

})

//.........This is the registration page..........
app.get("/register.hbs", function(request, response) {
    var user = {
        name: ""
    }
    response.render('register.hbs', {
        errors: [],
        user: user

    })
})

app.post("/register", function(request, response) {
    var hashedPassword = passwordHash.generate(request.body.password)
    var user = {
        name: request.body.username,
        password: hashedPassword
    }

    userManager.register(user, function(errors, user, authUser) {
        if (0 < errors.length) {
            response.render('register', {
                user: user,
                errors: errors
            })
        } else {

            request.session.newUser = authUser
            response.redirect('/protected_page')
        }
    })
})


//.............GET PROTECTED PAGE...................
app.get("/protected_page", function(request, response) {
    response.render('protected_page.hbs', {
        user: request.session.newUser.name

    })

})

//.............GET LOG IN PAGE...................

app.get("/logIn.hbs", function(request, response) {
    response.render('logIn.hbs', {
        bite: request.session.user
    })
})


app.post("/logIn", function(request, response) {

    var user = {
        name: request.body.username,
        password: request.body.password
    }

    userManager.logIn(user, function(errors, user, authUser) {
        if (0 < errors.length) {

            response.render('logIn', {

                errors: errors
            })
        } else {

            request.session.newUser = authUser
            response.redirect('/protected_page')
        }
    })
})


//................USER LOGS OUT..............
app.get('/logout', function(request, response) {
    request.session.destroy(function() {});
    response.redirect('/logIn.hbs');
})

//////////////////////////////MY API??/////////////////////////////////////////////////


app.get('/api/movies', function(request, response) {
    movieManager.getAll(function(errors, movies) {
        response.json(movies)
    })
})

app.get('/api/movies/:id', function(request, response) {
    var id = parseInt(request.params.id)
    movieManager.getById(id, function(errors, movie, rating) {
        if (movie) {
            var ratingArray = []
            for (var i = 0; i < rating.length; i++) {
                ratingArray.push(rating[i].rating)
            }
            var mov = {
                id: id,
                title: movie.title,
                year: movie.year,
                ratings: ratingArray
            }

            if (0 < errors.length) {
                response.status(500).send('something is wrong')

            } else {
                response.status(200)
                response.json(mov)
            }
        } else {
            response.status(404)
            response.json(null)
        }
    })
})

app.post('/api/tokens', function(request, response) {
    var user = {
        name: request.body.username,
        password: request.body.password
    }

    userManager.logIn(user, function(errors, user, authUser, token) {

        if (0 < errors.length) {
            response.status(401)
            response.json(null)

        } else {
            console.log(token)
            response.status(201)
            response.json(token)

        }


    })
})

app.post("/api/ratings", function(request, response) {
    var uId = request.body.userId

    if (request.headers.authorization) {

        ratingManager.getUserName(uId, function(errors, user) {

            if (0 < errors.length) {
                response.status(500).send('something is wrong')

            } else {

                var movieRate = {
                    title: request.body.title,
                    year: request.body.year,
                    rating: request.body.rating,
                    user: user.userName
                }

                ratingManager.pushNewRate(movieRate, function(errors, newMovie) {
                    if (0 < errors.length) {
                        if (errors[0] == "You have already rated this Movie") {
                            response.status(409)
                            response.json(null)
                        }

                    } else {

                        response.status(201)
                        response.json(null)
                    }
                })
            }
        })
    } else {
        response.status(401)
        response.json(null)
    }

})

app.delete("/api/ratings", function(request, response) {
    var movieDetails = {
        userId: request.query.userId,
        movieId: request.query.movieId
    }
    if (request.headers.authorization) {

        ratingManager.checkRate(movieDetails, function(errors, rate) {
            if (0 < errors.length) {
                response.status(500).send('something is wrong')
            } else if (rate) {

                userManager.delUserRate(movieDetails, function(errors) {
                    if (0 < errors.length) {
                        response.status(500).send('something is wrong')
                    } else {
                        response.status(204)
                    }

                })

            } else {
                response.status(404)
                response.json(null)
            }
        })
    } else {
        response.status(401)
        response.json(null)
    }

})
//////////////////////////////////////////////////////////////////////////////////////

app.listen(8000)
