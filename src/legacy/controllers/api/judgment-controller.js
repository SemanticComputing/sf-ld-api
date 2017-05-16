var self = {


  findByQuery: function(req,res,next) {
    // Import modules
    var _ = require('lodash');
    var util = require('util');
    var sparqlService = require('../../services/sparql-service');

    // omit non alphanumeric characters
    req.query.query=req.query.query.replace(/[^a-zA-ZäöåÄÖÅ0-9*"\s]/gi,'');
    // regex omit * and "
    var regexQuery=req.query.query.replace(/[^a-zA-ZäöåÄÖÅ0-9\s]/gi,'');

    var lang = req.query.lang ? req.query.lang : 'fi';

    var query = sparqlService.getPrefixes() + 'SELECT DISTINCT ?c ?l ?s ?t ?title ?abstract ?txt ?score ?matchType WHERE {\n'+
    '     {\n'+
  //    '        ?c text:query (skos:prefLabel \''+req.query.query+'*\' 20) . \n'+
    '        ?c a skos:Concept .\n'+
//    '        FILTER(regex(str(?c), "/kho/|/kko/" ) )\n'+
    '        ?c skos:prefLabel ?l .\n'+
    '        FILTER(regex(LCASE(str(?l)), LCASE(\''+regexQuery+'\') ) )\n'+
    '        FILTER(LANG(?l) = '+ (lang=='sv' ? '\'sv\'' : '\'fi\'')+' )\n'+
    '        VALUES ?score {100}\n'+
    '        VALUES ?matchType {\'keyword\'}\n'+
    '        ?s rdf:type sfcl:Judgment.\n'+
    '        ?s dcterms:description ?c .\n'+
    '        ?s sfcl:isRealizedBy ?e .\n'+
    '        ?e dcterms:language '+ (lang=='sv' ? '\'sv\'' : '\'fi\'')+'. \n'+
    '        ?e dcterms:title ?title .\n'+
    '        ?e dcterms:abstract ?abstract .\n'+
     '      } UNION {\n'+
     '        (?e ?score) text:query (dcterms:abstract \''+req.query.query+'*\' 20) . \n'+
     '        ?s rdf:type sfcl:Judgment.\n'+
     '        ?s sfcl:isRealizedBy ?e .\n'+
     '        ?e sfcl:isEmbodiedBy ?f .\n'+
     '        ?e dcterms:language '+ (lang=='sv' ? '\'sv\'' : '\'fi\'')+'. \n'+
     '        ?e dcterms:title ?title .\n'+
     '        ?f sfcl:text ?txt .\n'+
     '        VALUES ?matchType {\'abstract\'}\n'+
     '        ?e dcterms:abstract ?abstract .\n'+
    '      } UNION {\n'+
    '        (?f ?score) text:query (sfcl:text \''+req.query.query+'*\' 20) . \n'+
    '        ?s rdf:type sfcl:Judgment.\n'+
    '        ?s sfcl:isRealizedBy ?e .\n'+
    '        ?e sfcl:isEmbodiedBy ?f .\n'+
    '        ?e dcterms:language '+ (lang=='sv' ? '\'sv\'' : '\'fi\'')+'. \n'+
    '        ?e dcterms:title ?title .\n'+
    '        ?f sfcl:text ?txt .\n'+
    '        ?e dcterms:abstract ?abstract .\n'+
    '        VALUES ?matchType {\'content\'}\n'+
    '      }\n'+
    '    } GROUP BY ?s ?c ?l ?t ?title ?abstract ?txt ?score ?matchType ORDER BY DESC(?score)';//' LIMIT '+(req.query.limit!=undefined ? req.query.limit : '5');

    // Resolve format / content type and query type
    var contentType = "application/sparql-results+json"
    var queryType = sparqlService.resolveQueryType(contentType);
    var responseType = sparqlService.resolveResponseType(contentType);

    // Init SPARQL client
    var client = sparqlService.initClient(contentType);

    // Log SPARQL query
    sparqlService.logQuery(query);

    client.query(query)
      .execute(function(error, results) {
        if (error||!results)
          return res.send("Service unavailable", 500);
        if (results.results.bindings.length==0)
          return res.send("Not found", 404);
        res.set('Content-Type', responseType);
        var autoC = [];
        var searchRes = [];
        //console.log(results.results.bindings)
        _.each(results.results.bindings, function(binding) {
          searchRes.push({
            c: (binding.c != undefined) ? binding.c.value : '',
            l: (binding.l != undefined) ? binding.l.value : '',
            s: (binding.s != undefined) ? binding.s.value : '',
            abstract: (binding.abstract != undefined) ? binding.abstract.value : '',
            title: (binding.title != undefined) ? binding.title.value : '',
            txt: (binding.txt != undefined) ? binding.txt.value : '',
          })
          if (binding.matchType.value=='keyword')
            autoC.push({
              label: binding.l.value.toLowerCase(),
              type: 'keyword'
            });
          else if (binding.matchType.value=='abstract') {
            var match = binding.abstract.value.toLowerCase().match(new RegExp(req.query.query+"[^\\s.\]*(\\s+[^\\s\.]+){0,4}[^,:;\.]", 'i'));
            if (match != null) {
              match = match[0];
              var label = (match.indexOf('\n') != -1) ?
                match.substr(0, match.indexOf('\n')).toLowerCase() : match.toLowerCase();
              autoC.push({
                label: label,
                type: 'abstract'
              });
            }
          }
          else if (binding.matchType.value=='content') {
            var match = binding.txt.value.toLowerCase().match(new RegExp(req.query.query+"[^\\s.\]*(\\s+[^\\s\.]+){0,4}[^,:;\.]", 'i'));
            if (match != null) {
              match = match[0];
              var label = (match.indexOf('\n') != -1) ?
                match.substr(0, match.indexOf('\n')).toLowerCase() : match.toLowerCase();
              autoC.push({
                label: label,
                type: 'content'
              });
            }
          }
        })
        return res.send({
          autocomplete: _.uniqBy(autoC, function(elem) { return [elem.type, elem.label].join(); }),
          searchresults: _.uniqBy(searchRes, "s")
        })
      });
  },

  /**
   * Find judgments
   *
   * @param req request object
   * @param res response object
   * @param next callback
   *
   * @return list of judgements
   */
   find: function(req, res, next) {

     // Import modules
     var _ = require('lodash')
     var util = require('util');
     var sparqlService = require('../../services/sparql-service');
     var languageService = require('../../services/language-service');
     var namespaceService  = require('../../services/namespace-service');

     // Check params
     req.checkParams('year', 'Invalid year').optional().isInt();
     req.checkQuery('limit', 'Invalid limit').optional().isInt();
     req.checkQuery('language', 'Invalid limit').optional().isLanguage();
     req.checkQuery('format', 'Invalid format').optional().isFormat();

     var errors = req.validationErrors();
     if (errors) {
       return res.send('Invalid query: ' + util.inspect(errors), 400);
     }

     if (req.query.query) return self.findByQuery(req,res,next);

     // Resolve format / content type and query type
     //var contentType = sparqlService.resolveContentType(req.query.format);
     var contentType = "application/ld+json"
     var queryType = sparqlService.resolveQueryType(contentType);
     var responseType = sparqlService.resolveResponseType(contentType);

     // Get namespace URIs
     var sfcl = sparqlService.getNamespaceUri("sfcl");
     var rdf = sparqlService.getNamespaceUri("rdf");

     // Resolve Query parameters
     var language = (req.query.language) ? req.query.language : "fi";
     var content = (req.query.content) ? req.query.content : "txt";

     // Build SPARQL query string
     var queries = {
       'construct':
         "CONSTRUCT { ?d <" + rdf + "type>  <" + sfcl + "Judgment> . } WHERE " +
           "{ ?d <" + rdf + "type> <" + sfcl + "Judgment> . } LIMIT 50",
       'select': "SELECT ?d WHERE" +
         "{ ?d <" + rdf + "type> <" + sfcl + "Judgment> . } LIMIT 50 "
     }

     var query = queries[queryType];

     // Init SPARQL client
     var client = sparqlService.initClient(contentType);

     // Log SPARQL query
     sparqlService.logQuery(query);

     client.query(sparqlService.getPrefixes() + query)
       .execute(function(error, results) {
         res.set('Content-Type', responseType);
         if (!results)
           return res.send("Not found", 404)
         var jsonldService = require('../../services/jsonld-service');
         var results = jsonldService.organize(results)
         return res.send(results);
       });
   },



 /**
  * Find one judgment by ECLI identifier
  *
  * @param req request object
  * @param res response object
  * @param next callback
  *
  * @return judgement document
  */
  findOne: function(req, res, next) {

    // Import modules
    var _ = require('lodash');
    var util = require('util');
    var languageService = require('../../services/language-service');
    var sparqlService = require('../../services/sparql-service');
    var namespaceService  = require('../../services/namespace-service');

    // Check params
    req.checkParams('ecli', 'Invalid ECLI identifier').isECLI();
    req.checkQuery('language', 'Invalid language').optional().isLanguage();
    req.checkQuery('format', 'Invalid format').optional().isFormat();
    req.checkQuery('content', 'Invalid content type').optional().isContentType();

    var errors = req.validationErrors();
    if (errors) {
      res.send('Invalid query: ' + util.inspect(errors), 400);
      return;
    }

    // Resolve format / content type and query type
    //var contentType = sparqlService.resolveContentType(req.query.format);
    var contentType = "application/ld+json"
    var queryType = sparqlService.resolveQueryType(contentType);
    var responseType = sparqlService.resolveResponseType(contentType);

    // Get namespace URIs
    var caselaw = namespaceService.caselaw;
    var dcterms = sparqlService.getNamespaceUri("dcterms");
    var sfcl = sparqlService.getNamespaceUri("sfcl");
    var sioc = sparqlService.getNamespaceUri("sioc");

    // Resolve Query parameters
    var language = (req.query.language) ?
      languageService.getThreeLetterCodeByTwoLetterCode(req.query.language) : "fin";
    var content = (req.query.content) ? req.query.content : "txt";
    var abstract = dcterms + "abstract"

    // Resolve resources/proterties
    var document = caselaw + req.param('ecli');
    var contentPred = (content == "txt") ? sfcl + "text" : sfcl + content;

    // Build SPARQL query string
    var queries = {
      'construct':
        "CONSTRUCT { <" + document + "> ?p ?o . " +
          "<" + document + "> <" + abstract + "> ?abstract ." +
          "<" + document + "> <" + contentPred + "> ?content .}" +
          "WHERE { <" + document + "> ?p ?o . " +
            "OPTIONAL{<" + document + "/" + language + ">" +
              "<" + abstract + "> ?abstract . } " +
            "OPTIONAL{<" + document + "/" + language + "/" + content + ">" +
              "<" + contentPred + "> ?content . } " +
          "}",
      'select':
        "SELECT * WHERE {" +
          "{ <" + document + "> ?p ?o } " +
          "OPTIONAL{<" + document + "/" + language + ">" +
            "<" + abstract + "> ?abstract . } " +
          "OPTIONAL{<" + document + "/" + language + "/" + content + ">" +
            "<" + contentPred + "> ?content . } " +
        "}"
    }

    var query = queries[queryType];

    // Init SPARQL client
    var client = sparqlService.initClient(contentType);

    // Log SPARQL query
    sparqlService.logQuery(query);

    client.query(sparqlService.getPrefixes() + query)
      .execute(function(error, results) {
        res.set('Content-Type', responseType);
        if (!results)
          return res.send("Not found", 404)
        var jsonldService = require('../../services/jsonld-service');
        var results = jsonldService.organize(results)
        return res.send(results);
      });
  }


};


module.exports = self;
