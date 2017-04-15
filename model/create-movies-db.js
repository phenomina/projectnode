var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('movie-friends',OPEN_READWRITE);

db.run("CREATE TABLE if not exists movies (id INTEGER, title TEXT, year INTEGER)");
db.run("INSERT INTO person (id, title, year) VALUES(0, “Shrek”, “2001”)");
