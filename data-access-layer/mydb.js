var sqlite3 = require('sqlite3');
var db = new sqlite3.Database("movie-friends.db");
module.exports = db
