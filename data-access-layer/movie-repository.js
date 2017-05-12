var db = require('./mydb')

exports.getAll = function(callback) {
    var query = "SELECT id,title,year FROM movies"
    db.all(query, function(error, movies) {
        if (error) {
            console.log(error)
            callback(["databaseError"], null)
        } else {
            callback([], movies)
        }
    })
}

exports.getById = function(id, callback) {
    var query = "SELECT * FROM movies WHERE movies.id = :id"
    var query2 = "SELECT rating FROM movies,ratings WHERE movies.id = ratings.movieId AND movies.id = :id GROUP BY ratings.rating"
    db.get(query, {
        ":id": id
    }, function(error, movie) {
        if (error) {
            console.log(error)
            callback(["databaseError"], null)
        } else {
            db.all(query2, {
                ":id": id
            }, function(error, rating) {
                if (error) {
                    console.log(error)
                    callback(["databaseError"], null)
                } else {
                    callback([], movie, rating)
                }
            })
        }
    })
}


////////SPARQL//////////////////
// var fetch = require('isomorphic-fetch')
// var SparqlHttp = require('sparql-http-client')
// SparqlHttp.fetch = fetch
//
// // Setup an object we can use to send queries to the endpoint.
// var endpoint = new SparqlHttp({
//     endpointUrl: 'http://dbpedia.org/sparql'
// })
//
// // The query we will send to the endpoint
//
// var query = `PREFIX dbo: <http://dbpedia.org/ontology/>
// SELECT ?runtime ?movie ?abstract  (group_concat (DISTINCT ?directName;separator=",") as ?director) (group_concat(DISTINCT ?actors;separator=",") as ?actors)
// WHERE {
// ?movie rdf:type dbo:Film .
// ?movie rdfs:label "Shrek"@en .
// ?movie dbo:runtime ?runtime .
// ?movie dbo:abstract ?abstract .
// ?movie dbo:director ?director .
// ?director dbo:birthName ?directName .
// ?movie dbo:starring ?actorlist .
// ?actorlist dbo:birthName ?actors .
// FILTER (lang(?abstract) = 'en')
// }
// GROUP BY  ?abstract ?runtime ?movie`
//
// // Send the query as an HTTP request to the endpoint.
// endpoint.selectQuery(query).then(function(response) {
//     // This function is called when we get back the HTTP response.
//     // The result of the query is found in the body of the response
//     // as JSON. We can use the json method to parse the JSON code // into a JavaScript object. It returns a new promise which
//     // resolves when the parsing is complete
//     return response.json()
// }).then(function(result) {
//     console.log(JSON.stringify(result, null, 2))
//     console.log(JSON.stringify(result.results.bindings[0].runtime.value, null, 3));
// }).catch(function(error) {
//
// })
