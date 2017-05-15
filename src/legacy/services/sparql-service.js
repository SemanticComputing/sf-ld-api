var namespaces = require('./namespace-service').namespaces;

var self = {

  // Service endpoint
  //endpoint: 'http://130.233.124.183:3030/semantic-finlex/sparql',
  endpoint: 'http://localhost:3030/semantic-finlex/sparql',
  //endpoint: 'http://data.finlex.fi/sparql',

  // Formats for CONSTRUCT queries
  constructFormats: {
    'json-ld': 'application/ld+json',
    'n-triples': 'application/n-triples',
    'rdf-json': 'application/rdf+json',
    'rdf-xml': 'application/rdf+xml'
  },

  // Formats for SELECT queries
  selectFormats: {
    'csv': 'text/csv',
    'json': 'application/sparql-results+json',
    'xml': 'application/sparql-results+xml',
  },

  // Formats for API response
  responseFormats: {
    'application/ld+json': 'application/json',
    'application/n-triples': 'text/turtle',
    'application/rdf+json': 'application/json',
    'application/rdf+xml': 'application/xml',
    'text/csv': 'text/csv',
    'application/sparql-results+json': 'application/json',
    'application/sparql-results+xml': 'application/xml',
  },

  namespaces: namespaces,


 /**
  * Get namespace URI
  *
  * @param namespace name
  *
  * @return namespace uri
  */
  getNamespaceUri: function(namespace) {

    return this.namespaces[namespace];

  },


 /**
  * Get namespace prefixes
  *
  * @return prefixes
  */
  getPrefixes: function() {

    return "PREFIX common: <" + this.namespaces["common"] + ">\n" +
      "PREFIX dcterms: <" + this.namespaces["dcterms"] + ">\n" +
      "PREFIX rdf: <" + this.namespaces["rdf"] + ">\n" +
      "PREFIX eli: <" + this.namespaces["eli"] + ">\n" +
      "PREFIX sfl: <" + this.namespaces["sfl"] + ">\n" +
      "PREFIX sfcl: <" + this.namespaces["sfcl"] + ">\n" +
      "PREFIX skos: <" + this.namespaces["skos"] + ">\n" +
      "PREFIX text: <" + this.namespaces["text"] + ">\n" +
      "PREFIX xsd: <" + this.namespaces["xsd"] + ">\n" +
      "\n";
  },



 /**
  * Init new sparql client connected to a SPARQL endpoint
  *
  * @param contentType   select queries:     'application/sparql-results+json'|'application/sparql-results+xml'|'text/csv'
  *                      construct queries:  'application/ld+json'|'application/n-triples'|'application/rdf+json'|'application/rdf+xml'
  *
  * @return SparqlClient
  */
  initClient: function(contentType, endpoint) {

    var contentType = typeof contentType !== 'undefined' ?
      contentType : "application/json+ld";

    var endpoint = typeof endpoint !== 'undefined' ?
      endpoint : self.endpoint;

    // SPARQL client module
    var SparqlClient = require('./sparql-client/client');

    // Return new SPARQL client
    return new SparqlClient(endpoint, {}, contentType);

  },



 /**
  * Log query
  *
  * @param query SPARQL query string
  */
  logQuery: function(query) {

    console.log("Query: \n" + query);

  },


  /**
   * Organize query results
   *
   * @param results
   * @return organized results
   */
  organizeResults: function(results) {

    function buildLinkURI(uri) {
      return uri.replace("http://data.finlex.fi", "")
    }

    var _ = require('lodash')
    var namespaceService = require('../services/namespace-service');

    var result = []
    _.each(results.results.bindings, function(binding) {
      var subjectLink = (binding.s.type == "uri") ?
        buildLinkURI(binding.s.value) : "";
      var subjectValue = (binding.s.type == "uri") ?
        namespaceService.getPrefixForm(binding.s.value) : binding.s.value;
      var objectLink = (binding.o.type == "uri") ?
        buildLinkURI(binding.o.value) : "";
      var objectValue = (binding.o.type == "uri") ?
        namespaceService.getPrefixForm(binding.o.value) : binding.o.value;
      var predicateValue = namespaceService.getPrefixForm(binding.p.value);

      result.push({
        sType: binding.o.type,
        sValue: subjectValue,
        sLink: subjectLink,
        pValue: predicateValue,
        oType: binding.o.type,
        oValue: objectValue,
        oLink: objectLink
      });
    });

    return result;
  },


 /**
  * Resolve SPARQL query type
  *
  * @param format requested format
  *
  * @return content type string
  */
  resolveContentType: function(format) {

    // No format specified, return default
    if (!format) return 'application/ld+json';

    // Construct format
    else if (this.constructFormats[format] !== undefined)
      return this.constructFormats[format];

    // Select format
    else if (this.selectFormats[format] !== undefined)
      return this.selectFormats[format];

    // Not a valid format, return default
    return 'application/ld+json';

  },



 /**
  * Resolve SPARQL query type
  *
  * @param contentType string
  *
  * @return query type string
  */
  resolveQueryType: function(contentType) {

    var selectTypes = [
      'text/csv',
      'application/sparql-results+json',
      'application/sparql-results+xml'
    ];

    // Get query type by content type
    var type = (selectTypes.indexOf(contentType) > -1) ? 'select' : 'construct';

    // Return query type
    return type;

  },



 /**
  * Resolve API response type
  *
  * @param contentType string
  *
  * @return response type string
  */
  resolveResponseType: function(contentType) {

    // Get query type by content type
    var type = this.responseFormats[contentType];

    // Return query type
    return type;

  }

};

module.exports = self;
