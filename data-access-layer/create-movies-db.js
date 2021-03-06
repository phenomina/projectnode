var sqlite3 = require('sqlite3');
var db = new sqlite3.Database("movie-friends.db");
var passwordHash = require('password-hash')

var movies = [{
        id: 1,
        title: "Shrek",
        year: 2001
    },
    {
        id: 2,
        title: "Dumb & Dumber",
        year: 1995
    },
    {
        id: 3,
        title: "The Lion King",
        year: 1994
    }
]

var ratings = [{
        movieId: 1,
        userId: 1,
        rating: 5
    },
    {
        movieId: 2,
        userId: 1,
        rating: 3
    },
    {
        movieId: 3,
        userId: 1,
        rating: 4
    },
    {
        movieId: 1,
        userId: 2,
        rating: 4
    }
]

var roles = [{

        title: "admin"
    },
    {

        title: "read-writer"
    },
    {

        title: "read"
    }
]

var rol = [{
        tit: "1",
        title: "1"
    },
    {
        tit: "2",
        title: "2"
    },
    {
        tit: "3",
        title: "3"
    }
]


db.serialize(function() {

    // Populating the movies database from the array

    db.run("CREATE TABLE if not exists movies (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, year INTEGER, runtime INTEGER, director TEXT, actor TEXT, abstract TEXT)");
    // var stmt = db.prepare("INSERT INTO movies VALUES (?,?,?)");
    // for (var i = 0; i < movies.length; i++) {
    //     if (movies[i].id && movies[i].title && movies[i].year)
    //         stmt.run(movies[i].id, movies[i].title, movies[i].year);
    // }
    // stmt.finalize();

    // Populating the ratings database from the array

    db.run("CREATE TABLE if not exists ratings (movieId INTEGER,userId INTEGER,rating INTEGER)");
    // var fill = db.prepare("INSERT INTO ratings VALUES (?,?,?)");
    // for (var i = 0; i < ratings.length; i++) {
    //     if (ratings[i].movieId && ratings[i].userId && ratings[i].rating)
    //         fill.run(ratings[i].movieId, ratings[i].userId, ratings[i].rating);
    // }
    // fill.finalize();

    //creating the users table
    db.run("CREATE TABLE if not exists users (userId INTEGER PRIMARY KEY AUTOINCREMENT, userName TEXT,password TEXT,fName TEXT,lName TEXT,gender TEXT,status TEXT)");

    db.run("CREATE TABLE if not exists friends (id INTEGER PRIMARY KEY AUTOINCREMENT,userID INTEGER,friendID INTEGER)");

    db.run("INSERT INTO users(userName,password,fName,lName,gender,status) VALUES (?,?,?,?,?,?)", "admin", passwordHash.generate('1234'), "Tom", "Cruise", "M", "private");


    //creating the roles table
    db.run("CREATE TABLE if not exists roles (id INTEGER PRIMARY KEY AUTOINCREMENT ,roleName TEXT)");
    var fill = db.prepare("INSERT INTO roles(roleName) VALUES (?)");
    for (var i = 0; i < roles.length; i++) {
        if (roles[i].title)
            fill.run(roles[i].title);
    }
    fill.finalize();

    db.run("CREATE TABLE if not exists memberRoles (memberId INTEGER,roleId INTEGER)");
    var fill = db.prepare("INSERT INTO memberRoles VALUES (?,?)");
    fill.run(1, 1);
    fill.finalize();



    //Display values on database to verify insert
    var results = db.each("SELECT id,title,year FROM movies", function(err, row) {
        console.log(row.id + ": " + row.title + ": " + row.year)
    })

    db.each("SELECT movieId,rating FROM ratings", function(err, row2) {

        console.log(row2.movieId + ": " + row2.rating)

    })

})


module.exports = db
