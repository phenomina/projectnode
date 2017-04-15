var sqlite3 = require('sqlite3');
var db = new sqlite3.Database("movie-friends.db");

var roles = [{

        title: "reader"
    },
    {

        title: "writer"
    },
    {

        title: "admin"
    }
]



var stmt = db.prepare("INSERT INTO memberRoles VALUES (?,?)");
for (var i = 0; i < roles.length; i++) {
    if (roles[i].title)
        stmt.run(roles[i].title);
}
stmt.finalize();
