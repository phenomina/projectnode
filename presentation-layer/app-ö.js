var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var session = require('express-session')
var passwordHash = require('password-hash')
//var userManager = require('../business-logic-layer/user-manager')

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: "my-salt"
}))

app.use(function(request, response, next) {
    response.locals.session = request.session.user
    next()
})

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database("movie-friends.db");


app.use(bodyParser.urlencoded({
    extended: false
}))


/*.......GET START PAGE.............*/

app.set("view engine", "hbs")
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

app.get("/movies.hbs", function(request, response) {

    db.all("SELECT id,title,year FROM movies", function(err, row) {

        response.render('movies.hbs', {
            movies: row,
            bite: request.session.user

        })

    })


})

//................GET ALL USERS..................
app.get("/users.hbs", function(request, response) {

    db.all("SELECT userId,userName FROM users", function(err, row) {

        response.render('users.hbs', {
            users: row,
            bite: request.session.user
        })

    })


})
//......................................................................................................................................................
//.................................................GET EACH USER DETAIL..................................................
//......................................................................................................................................................

app.get("/users/:userId", function(request, response) {
    var id = parseInt(request.params.userId)

    db.all("SELECT id,title,rating FROM movies,ratings WHERE movies.id = ratings.movieId AND ratings.userId =?", id, function(err, row) {


        response.render('user.hbs', {
            user: row,
            bite: request.session.user
        })

    })
})

/*.......GET USER ACCOUNT DETAILS.............*/

app.get("/user_account.hbs", function(request, response) {

    db.all("SELECT id,title,rating FROM movies,ratings,users WHERE movies.id = ratings.movieId AND users.userId = ratings.userId AND users.userName =?", request.session.user.id,
        function(err, row) {

            response.render('user_account.hbs', {
                user: row
            })

        })
})

/*.......GET ADMIN ACCOUNT DETAILS.............*/

app.get("/admin.hbs", function(request, response) {
    if (request.session.user.role != "admin") {
        response.status(401).send("Really Dude!! You know you have no access!!")
    }

    db.all("SELECT id,title,rating,userName,users.userId AS userID FROM movies,ratings,users WHERE movies.id = ratings.movieId AND users.userId = ratings.userId",
        function(err, row) {

            response.render('admin.hbs', {
                user: row
            })

        })
})

/*.......DELETE USER RATING.............*/

app.post("/movies/:id", function(request, response) {
    var id = parseInt(request.params.id)

    db.get("SELECT userId FROM users WHERE userName=?", request.session.user.id, function(err, row) {

        db.run("DELETE FROM ratings WHERE ratings.movieId=? AND ratings.userId=?", id, row[0].userId)

        db.all("SELECT movieId FROM ratings WHERE ratings.movieId=?", id, function(err, row1) {

            if (row1.length == 0) {
                db.run("DELETE FROM movies WHERE movies.id=?", id)
            }

            response.redirect('/user_account.hbs')
        })
    })
})

/*.......ADMIN DELETE RATING.............*/

app.post("/delete_rating", function(request, response) {
    var userID = request.body.userID
    var movieID = request.body.movieID
    console.log("movieid:", movieID);
    console.log("userid:", userID);

    db.run("DELETE FROM ratings WHERE ratings.movieId=? AND ratings.userId=?", movieID, userID)

    db.all("SELECT movieId FROM ratings WHERE ratings.movieId=?", movieID, function(err, row1) {

        if (row1.length == 0) {
            db.run("DELETE FROM movies WHERE movies.id=?", movieID)
        }

        response.redirect('/admin.hbs')
    })

})

/*.......GET EACH MOVIE GIVEN PAGE.............*/

app.get("/movies/:id", function(request, response) {
    var id = parseInt(request.params.id)

    db.get("SELECT title,year FROM movies WHERE movies.id =?", id, function(err, row) {

        db.all("SELECT rating FROM movies,ratings WHERE movies.id = ratings.movieId AND movies.id =? GROUP BY ratings.rating", id,
            function(err, row2) {

                response.render('movie.hbs', {
                    movie: row,
                    rating: row2,
                    bite: request.session.user
                })

            })

    })


})


//.............RATE MOVIE...................

app.get("/rating.hbs", function(request, response) {
    response.render('rating.hbs', {
        bite: request.session.user
    })
})

app.post("/rating", function(request, response) {

    db.all("SELECT id,title,year FROM movies", function(err, row) {
        // where lower(title) = ?
        var newMovie = {
            id: row.length + 1,
            title: request.body.title,
            year: parseInt(request.body.year)
        }

        var check = 0

        for (var i = 0; i < row.length; i++) {
            if (row[i].title.toLowerCase() == request.body.title.toLowerCase() && row[i].year == parseInt(request.body.year)) {
                newMovie.id = row[i].id
                check = 1
            }
        }

        if (check == 0) {
            var fill = db.prepare("INSERT INTO movies VALUES (?,?,?)");
            fill.run(newMovie.id, newMovie.title, newMovie.year);
            fill.finalize();
        }

        db.get("SELECT userId FROM users WHERE userName=?", request.session.user.id, function(err, row3) {


            db.all("SELECT userId FROM ratings WHERE movieId=? AND userId=?", newMovie.id, row3.userId, function(err, row2) {

                var newRating = {
                    movieId: newMovie.id,
                    userId: row3.userId,
                    rating: parseInt(request.body.newRate)
                }

                if (row2.length == 0) {
                    var fill = db.prepare("INSERT INTO ratings VALUES (?,?,?)");
                    fill.run(newRating.movieId, newRating.userId, newRating.rating);
                    fill.finalize();
                    // Redirect the client to the page showing information about the new movie.
                    response.redirect("/movies/" + newMovie.id)
                } else {
                    response.render('rating', {
                        message: "You have already rated this movie before, Try another one",
                        bite: request.session.user
                    })
                }
            })
        })
    })


})

//.........This is the registration page..........
app.get("/register.hbs", function(request, response) {
    response.render('register.hbs', {
        bite: request.session.user
    })
})

app.post("/register", function(request, response) {


    db.all("SELECT username FROM users WHERE users.username=?", request.body.username, function(err, row) {

        var hashedPassword = passwordHash.generate(request.body.password)
        db.serialize(function() {
            var fill = db.prepare("INSERT INTO users (userName,password) VALUES (?,?)");

            if (row.length == 0) {
                fill.run(request.body.username, hashedPassword);
                fill.finalize();

                db.get("SELECT userId FROM users WHERE users.username=?", request.body.username, function(err, row3) {
                    var newUser = {
                        id: request.body.username,
                        password: hashedPassword
                    };
                    db.run("INSERT INTO memberRoles VALUES (?,?)", row3.userId, 2)
                    db.run("INSERT INTO memberRoles VALUES (?,?)", row3.userId, 3)
                    request.session.user = newUser;
                    response.redirect('/protected_page');
                })
            } else
                response.render('register', {
                    message: "User Already Exists! Login or choose another username"
                })

        })

    })

})

//.............GET PROTECTED PAGE...................
app.get("/protected_page", function(request, response) {
    response.render('protected_page.hbs', {
        username: request.session.user.id,
        bite: request.session.user
    })
})

//.............GET LOG IN PAGE...................

app.get("/logIn.hbs", function(request, response) {
    response.render('logIn.hbs', {
        bite: request.session.user
    })
})

app.post("/logIn", function(request, response) {

    db.all("SELECT userId,username,password FROM users WHERE users.username=?", request.body.username, function(err, row) {

        if (row.length == 0) {
            response.render('logIn', {
                message: "Username does not Exist! Please register "

            })
        } else {
            if (passwordHash.verify(request.body.password, row[0].password)) {
                //create the session and redirect the user

                db.all("SELECT roleName FROM roles, memberRoles WHERE roles.id = memberRoles.roleId and memberRoles.memberId=?", row[0].userId, function(err, row1) {
                    var newUser = {
                        id: request.body.username,
                        password: row[0].password,
                        role: row1[0].roleName
                    };
                    request.session.user = newUser
                    response.redirect('/protected_page')

                })
            } else {
                response.render('logIn', {
                    message: "Wrong password, Try again!! "

                })
            }
        }
    })

})

//................USER LOGS OUT..............
app.get('/logout', function(request, response) {
    request.session.destroy(function() {});
    response.redirect('/logIn.hbs');
})

app.listen(8000)
