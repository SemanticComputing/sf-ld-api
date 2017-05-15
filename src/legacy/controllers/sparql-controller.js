var self = {



 /**
  * Execute sparql query
  *
  * @param req request object
  * @param res response object
  * @param next callback
  *
  * @return json response
  */
  /*query: function(req, res, next) {

    // Import modules
    var _ = require('lodash')
    var sparqlService = require('../services/sparql-service');

    // Default format
    var contentType = 'application/sparql-results+json';

    // Build SPARQL query string
    var query = req.param('query');

    // Init SPARQL client
    var client = sparqlService.initClient(contentType);

    // Log SPARQL query
    sparqlService.logQuery(query);

    client.query(sparqlService.getPrefixes() + query)
      .execute(function(error, results){
        res.set('Content-Type', contentType);
        return res.send(results);
      });
  }*/


};


module.exports = self;
