var self = {

 /**
  * Find resource RDF
  *
  * @param req request object
  * @param res response object
  * @param next callback
  */
  findResource: function(req, res, next) {

   //console.log(req.get('Accept'))

   // Import modules
   var _ = require('lodash')
   var sparqlService = require('../../services/sparql-service');

   // Default format
   var contentType = 'application/n-triples';

   var subject = "<http://data.finlex.fi" + req.originalUrl.replace(".rdf", "") + ">"

   // Build SPARQL query string
   var query = "CONSTRUCT  { " + subject + " ?p ?o } WHERE { " + subject + " ?p ?o }";

   // Init SPARQL client
   var client = sparqlService.initClient(contentType);

   // Log SPARQL query
   sparqlService.logQuery(query);

   client.query(sparqlService.getPrefixes() + query)
     .execute(function(error, results) {
       // Plain text content type to open turtle file in browser
       res.set('Content-Type', contentType);

       if (!results)
         return res.send("Not found", 404)

       return res.send(results);
   });
 },


 /**
  * Find list of statutes RDF
  *
  * @param req request object
  * @param res response object
  * @param next callback
  */
  findStatutes: function(req, res, next) {

   //console.log(req.get('Accept'))

   // Import modules
   var _ = require('lodash')
   var sparqlService = require('../../services/sparql-service');

   // Default format
   var contentType = 'application/n-triples';

   var subject = "<http://data.finlex.fi" + req.originalUrl.replace(".rdf", "") + ">"

   // Build SPARQL query string
   var query = "CONSTRUCT  { ?s rdf:type sfl:Statute } WHERE { ?s rdf:type sfl:Statute . } LIMIT 50";

   // Init SPARQL client
   var client = sparqlService.initClient(contentType);

   // Log SPARQL query
   sparqlService.logQuery(query);

   client.query(sparqlService.getPrefixes() + query)
     .execute(function(error, results) {
       // Plain text content type to open turtle file in browser
       res.set('Content-Type', contentType);

       if (!results)
         return res.send("Not found", 404)

       return res.send(results);
    });
  },


  /**
   *  Find list of statutes RDF by year
   *
   * @param req request object
   * @param res response object
   * @param next callback
   */
   findStatutesByYear: function(req, res, next) {

    //console.log(req.get('Accept'))

    // Import modules
    var _ = require('lodash')
    var sparqlService = require('../../services/sparql-service');

    // Default format
    var contentType = 'application/n-triples';

    // Build SPARQL query string
    var query = "CONSTRUCT  { ?s rdf:type sfl:Statute } WHERE { ?s rdf:type sfl:Statute ."+
      "?s eli:id_local ?id ."+
      "FILTER(REGEX(STR(?id), \"\/"+req.query.year+"\", \"i\")) }";

    // Init SPARQL client
    var client = sparqlService.initClient(contentType);

    // Log SPARQL query
    sparqlService.logQuery(sparqlService.getPrefixes() + query);

    client.query(sparqlService.getPrefixes() + query)
      .execute(function(error, results) {
        // Plain text content type to open turtle file in browser
        res.set('Content-Type', contentType);

        if (!results)
          return res.send("Not found", 404)

        return res.send(results);
     });
   },


};

module.exports = self;
