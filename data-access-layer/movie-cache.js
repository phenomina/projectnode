var db = require('./mydb')
var fetch = require('isomorphic-fetch')
var SparqlHttp = require('sparql-http-client')
SparqlHttp.fetch = fetch

// Setup an object we can use to send queries to the endpoint.
var endpoint = new SparqlHttp({
    endpointUrl: 'http://dbpedia.org/sparql'
})

// The query we will send to the endpoint

var query = `PREFIX dbo: <http://dbpedia.org/ontology/>
SELECT ?runtime ?movie ?abstract
WHERE {
?movie rdf:type dbo:Film .
?movie rdfs:label "Shrek"@en .
?movie dbo:runtime ?runtime .
?movie dbo:abstract ?abstract
FILTER (lang(?abstract) = 'en')
 }`

// Send the query as an HTTP request to the endpoint.
endpoint.selectQuery(query).then(function(response) {
    // This function is called when we get back the HTTP response.
    // The result of the query is found in the body of the response
    // as JSON. We can use the json method to parse the JSON code // into a JavaScript object. It returns a new promise which
    // resolves when the parsing is complete
    return response.json()
}).then(function(result) {
    console.log(JSON.stringify(result, null, 2))
    console.log(JSON.stringify(result.results.bindings[0].runtime.value, null, 3));
}).catch(function(error) {})
