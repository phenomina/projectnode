var db = require('./mydb')
var fetch = require('isomorphic-fetch')
var SparqlHttp = require('sparql-http-client')

function getSparql(movieRate, callback) {
    SparqlHttp.fetch = fetch

    // Setup an object we can use to send queries to the endpoint.
    var endpoint = new SparqlHttp({
        endpointUrl: 'http://dbpedia.org/sparql'
    })
    var query2 = `PREFIX dbo: <http://dbpedia.org/ontology/>
  SELECT ?runtime ?movie ?abstract (group_concat (DISTINCT ?directName;separator=", ") as ?director) (group_concat(DISTINCT ?actors;separator=", ") as ?actors)
  WHERE {
  ?movie rdf:type dbo:Film .
  ?movie rdfs:label "` + movieRate.title + `"@en .
  ?movie dbo:runtime ?runtime .
  ?movie dbo:abstract ?abstract .
  ?movie dbo:director ?director .
  OPTIONAL {?director dbo:birthName ?directName .}
  ?movie dbo:starring ?actorlist .
  OPTIONAL {?actorlist dbo:birthName ?actors .}
  FILTER (lang(?abstract) = 'en')
  }
  GROUP BY  ?abstract ?runtime ?movie`


    endpoint.selectQuery(query2).then(function(response) {

        return response.text()
    }).then(function(rez) {
        var result = (JSON.parse(rez))
        callback(result)
    }).catch(function(error) {

    })


}

exports.getMovie = function(movieRate, callback) {
    db.serialize(function() {

        var query = "SELECT id, title FROM movies WHERE title= :title"
        db.all(query, {
            ":title": movieRate.title
        }, function(error, row) {
            if (row.length == 0) {
                getSparql(movieRate, function(result) {

                    if (result.results.bindings.length == 0) {
                        var empty = []
                        empty.push("Does not exist")
                        callback(null, empty)
                    } else {

                        db.run("INSERT INTO movies (title,year,runtime,director,actor,abstract) VALUES (?,?,?,?,?,?)", movieRate.title, movieRate.year, result.results.bindings[0].runtime.value, result.results.bindings[0].director.value, result.results.bindings[0].actors.value, result.results.bindings[0].abstract.value)
                        db.get("SELECT userId FROM users WHERE userName=?", movieRate.user, function(err, row3) {

                            db.all("SELECT id FROM movies WHERE title=?", movieRate.title, function(err, rowTitle) {

                                db.all("SELECT userId FROM ratings WHERE movieId=? AND userId=?", rowTitle[0].id, row3.userId, function(err, row2) {

                                    callback(row2.length, [])

                                })
                            })
                        })
                    }
                })
            } else {

                db.get("SELECT userId FROM users WHERE userName=?", movieRate.user, function(err, row3) {

                    db.all("SELECT id FROM movies WHERE title=?", movieRate.title, function(err, rowTitle) {

                        db.all("SELECT userId FROM ratings WHERE movieId=? AND userId=?", rowTitle[0].id, row3.userId, function(err, row2) {

                            callback(row2.length)

                        })
                    })

                })


            }

        })
    })
}

exports.insertRate = function(movieRate, callback) {
    db.get("SELECT id FROM movies WHERE title=?", movieRate.title, function(err, rowTitle) {
        db.get("SELECT userId FROM users WHERE userName=?", movieRate.user, function(err, row3) {
            db.run("INSERT INTO ratings (movieId,userId,rating) VALUES (?,?,?)", rowTitle.id, row3.userId, movieRate.rating)
        })
        callback(rowTitle.id)
    })

}


exports.getUserName = function(uId, callback) {

    var checkquery = "SELECT username FROM users WHERE userId= :id"
    db.get(checkquery, {
        ":id": uId
    }, function(error, row) {
        if (error) {
            console.log(error)
            callback(["databaseError"], null)
        } else {
            console.log(row);
            callback([], row)
        }
    })

}

exports.checkRate = function(movieDetails, callback) {
    db.get("SELECT rating FROM ratings WHERE userId= :userID AND movieId = :movID", {
        ":userID": movieDetails.userId,
        ":movID": movieDetails.movieId
    }, function(error, row) {
        if (error) {
            console.log(error)
            callback(["databaseError"], null)
        } else {
            console.log(row);
            callback([], row)
        }
    })
}
