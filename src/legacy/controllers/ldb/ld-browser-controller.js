var self = {

 /**
  * Find manifestation html
  *
  * @param req request object
  * @param res response object
  * @param next callback
  *
  * @return resource
  */
  findHtml: function(req, res, next) {

    // Import modules
    var _ = require('lodash')
    var sparqlService = require('../../services/sparql-service');

    // Default format
    var contentType = 'application/sparql-results+json';

    var subject =
      "<http://data.finlex.fi" + req.originalUrl.replace(".html", "/html") + ">";

    var sfl = sparqlService.getNamespaceUri("sfl");
    var sfcl = sparqlService.getNamespaceUri("sfcl");
    var predicate = (req.originalUrl.indexOf('/eli/sd/') > -1 ) ?
      "<"+sfl+"html>" : "<"+sfcl+"html>";

    var query = "";

    if (req.originalUrl.indexOf('/eli/sd/') > -1 && (req.originalUrl.indexOf('/alkup') == -1 && req.originalUrl.indexOf('/ajantasa/') == -1)) {
      var subject =
        "<http://data.finlex.fi" + req.originalUrl.replace(/\/(fin|swe)\.html/g, "") + ">";
      var query = "SELECT ?o WHERE {" +
        "{" +
          "SELECT ?sv ?dv WHERE {" +
            subject+" eli:has_member ?sv ." +
            "OPTIONAL {?sv eli:version_date ?dv .}" +
          "} ORDER BY DESC(?dv) LIMIT 1" +
        "}"+
        "BIND(IRI(CONCAT(str(?sv),\"/fin/html\")) AS ?format)"+
        "?format sfl:html ?o ."+
      "}";
    } else {
      // Build SPARQL query string
      var query = "SELECT * WHERE { " + subject + " " + predicate + " ?o }";
    }

    // Init SPARQL client
    var client = sparqlService.initClient(contentType);

    // Log SPARQL query
    sparqlService.logQuery(query);

    client.query(sparqlService.getPrefixes() + query)
      .execute(function(error, results){
        //res.set('Content-Type', contentType);
        //return res.send(results);
        if (!results || !results.results)
          return res.status(503).send("Service unavailable")

        var html = results.results.bindings[0] ? results.results.bindings[0].o.value : "";

        res.render('html', {title: subject, 'html': html});

      });
  },


  /**
   * Find judgment
   *
   * @param req request object
   * @param res response object
   * @param next callback
   *
   * @return resource
   */
   findJudgment: function(req, res, next) {

     function buildLinkURI(uri) {
       return uri.replace("http://data.finlex.fi/", "/")
     }

     // Import modules
     var _ = require('lodash')
     var sparqlService = require('../../services/sparql-service');
     var namespaceService = require('../../services/namespace-service');

     // Default format
     var contentType = 'application/sparql-results+json';

     var subject = "<http://data.finlex.fi" + req.originalUrl + ">"
     var language = (req.headers['accept-language'].lastIndexOf("sv-SE", 0) === 0) ? "swe" : "fin";

     // Build SPARQL query string
     var query = 'SELECT ?p ?o ?html ?title ?r ?st ?j2 ?j2t ?j2a ?d ?dl ?j3 ?j3t ?j3a ?b ?bl ?rels ?relst ?c2 ?l2  WHERE {\n'+
        '{\n'+
         subject+' ?p ?o . \n'+
        'BIND('+subject+' AS ?j)\n'+
        'BIND(IRI(CONCAT(str(?j),\"/'+language+'\")) AS ?e) \n'+
        '?e dcterms:title ?title .\n'+
        'BIND(IRI(CONCAT(str(?j),\"/'+language+'/html\")) AS ?f)\n' +
        '?f sfcl:html ?html . \n'+
        '} UNION {\n'+
        '	{\n'+
        '     	SELECT ?sv ?r WHERE {\n'+
        '     '+subject+' sfcl:refToLegislation ?r .\n'+
        '			?r eli:has_member ?sv .\n'+
        '			OPTIONAL{?sv eli:version_date ?dv .\n}'+
        '		} ORDER BY DESC(?dv) LIMIT 1\n'+
        '	}\n'+
        '	BIND(IRI(CONCAT(str(?sv),"/fin")) AS ?se) \n'+
        '	OPTIONAL { ?se eli:title ?st . }\n'+
        '   }\n'+
        'UNION {\n'+
        'SELECT ?j2 ?j2t ?j2a ?d ?dl WHERE {'+
        '    BIND('+subject+' AS ?j)\n'+
        '    ?j dcterms:description ?d .\n'+
        '    ?j2 dcterms:description ?d .\n'+
        '    ?d skos:prefLabel ?dl .\n'+
        '    FILTER NOT EXISTS { ?narrower skos:broader ?d  .}\n'+
        '    FILTER(lang(?dl) = \'fi\' )'+
        '    FILTER (?j2 != ?j)\n'+
        '    BIND(IRI(CONCAT(str(?j2),"/'+language+'")) AS ?j2e)\n'+
        '    ?j2e dcterms:title ?j2t .\n'+
        '    ?j2e dcterms:abstract ?j2a .\n'+
        '} LIMIT 5'+
        '  }\n'+
        '    UNION {\n'+
        'SELECT ?j3 ?j3t ?j3a ?b ?bl WHERE {'+
        '    BIND('+subject+' AS ?j)\n'+
        '    ?j dcterms:description ?d .\n'+
        '    ?d skos:broader ?b .\n'+
        '    ?j3 dcterms:description ?b .\n'+
        '    FILTER NOT EXISTS { ?j3 dcterms:description ?d .}\n'+
        '    ?b skos:prefLabel ?bl .\n'+
        '    FILTER(lang(?bl) = \'fi\' )'+
        '    FILTER (?j3 != ?j)\n'+
        '    BIND(IRI(CONCAT(str(?j3),"/'+language+'")) AS ?j3e)\n'+
        '    ?j3e dcterms:title ?j3t .\n'+
        '    ?j3e dcterms:abstract ?j3a .\n'+
        '} LIMIT 5'+
        '  }\n'+
        '    UNION {\n'+
        'SELECT DISTINCT ?rels ?relst ?c2 ?l2 WHERE {'+
        '    BIND('+subject+' AS ?j)\n'+
        '  ?j dcterms:description ?c1 .'+
        '  ?relsv eli:is_about ?c2 .'+
        '  ?relsv sfl:isVersionOf ?rels .'+
        '  FILTER(regex(LCASE(str(?c1)), LCASE(\'/kko/'+language+'\') ) )'+
        '  FILTER(regex(LCASE(str(?c2)), LCASE(\'/finlex/\') ) )'+
        '    ?c1 skos:prefLabel ?l1 .'+
        '    ?c2 skos:prefLabel ?l2 .'+
        '  FILTER(LCASE(str(?l1)) = LCASE(str(?l2)) )'+
        '  FILTER(lang(?l1) = lang(?l2) )'+
        '  BIND(IRI(CONCAT(str(?relsv),"/'+language+'")) AS ?se) '+
        '  OPTIONAL { ?se eli:title ?relst . }'+
        '} LIMIT 5 '+
        '  }\n'+
     '} ORDER BY ?p';


     // Init SPARQL client
     var client = sparqlService.initClient(contentType);

     // Log SPARQL query
     sparqlService.logQuery(query);
     client.query(sparqlService.getPrefixes() + query)
       .execute(function(error, results) {


        if (error||!results)
          return res.status(503).render("error", {"message": "Service unavailable"})
        if (results.results.bindings.length==0)
          return res.status(404).render("error", {"message": "Resource not found"})

         var result = []

         var html='';
         var title='';
         var refsToLegislation = [];
         var relatedCases = {};
         var relatedStatutes = {};
         var broadlyRelatedCases = {};
         //console.log(results.results.bindings);
         _.each(results.results.bindings, function(binding) {

           if (binding.html !== undefined)
             html = binding.html.value;
           if (binding.title !== undefined)
             title = binding.title.value;
           if (binding.r !== undefined && binding.st !== undefined) {
             refsToLegislation.push({
               uri: binding.r.value,
               title: binding.st.value
             });
           }
           if (binding.j2 !== undefined && binding.j2t !== undefined && binding.d !== undefined && binding.dl !== undefined) {
             if (relatedCases[binding.d.value] == undefined) relatedCases[binding.d.value] =  {term: binding.dl.value, termUri: binding.d.value, docs: []};
             relatedCases[binding.d.value].docs.push({
               uri: binding.j2.value,
               title: binding.j2t.value,
               abstract: binding.j2a.value
                .replace('Kort referat på svenska','')
                .replace(/^\s*\n/mg,'\n')
                .replace(/^\s*(?=[^\s])/gm,'\n')
                .replace(/\s*$/,''),
             });
           }
           if (binding.j3 !== undefined && binding.j3t !== undefined && binding.b !== undefined&& binding.bl !== undefined) {
             if (broadlyRelatedCases[binding.b.value] == undefined) broadlyRelatedCases[binding.b.value] =  {term: binding.bl.value, termUri: binding.b.value, docs: []};
             broadlyRelatedCases[binding.b.value].docs.push({
               uri: binding.j3.value,
               abstract: binding.j3a.value
                .replace('Kort referat på svenska','')
                .replace(/^\s*\n/mg,'\n')
                .replace(/^\s*(?=[^\s])/gm,'\n')
                .replace(/\s*$/,''),
               title: binding.j3t.value,
             });
           }
           if (binding.rels !== undefined && binding.relst !== undefined && binding.c2 !== undefined && binding.l2 !== undefined) {
            if (relatedStatutes[binding.c2.value] == undefined) relatedStatutes[binding.c2.value] = {term: binding.l2.value, termUri: binding.c2.value, docs: []};
             relatedStatutes[binding.c2.value].docs.push({
               uri: binding.rels.value,
               title: binding.relst.value,
             });
           }
           if (binding.p !== undefined && binding.o !== undefined ) {
             var objectUri = "";
             var objectLabel = binding.o.value;
             var objectType = binding.o.type;
             var predicateLabel = namespaceService.getPrefixForm(binding.p.value);
             if (objectType == "uri") {
               objectUri = binding.o.value;
               objectLabel = namespaceService.getPrefixForm(binding.o.value);
             }
             result.push({
               predicateLabel: predicateLabel,
               predicateUri: binding.p.value,
               objectType: binding.o.type,
               objectLabel: objectLabel,
               objectUri: objectUri
             });
           }
         });

         //@DEBUG
         //console.log(result)

         var templateVariables = {
           subject: subject,
           subjectUri: subject.substring(1, subject.length-1),
           resource: result,
           refsToLegislation: refsToLegislation,
           relatedCases: relatedCases,
           broadlyRelatedCases: broadlyRelatedCases,
           relatedStatutes: relatedStatutes,
           html: html,
           title: title
         };

         console.log(relatedStatutes)

         // Build SPARQL query string
         query = "SELECT * WHERE { ?s ?p " + subject + " } ORDER BY ?p";

         // Init SPARQL client
         var client = sparqlService.initClient(contentType);

         // Log SPARQL query
         sparqlService.logQuery(query);

         client.query(sparqlService.getPrefixes() + query)
           .execute(function(error, results) {

             if (error||!results)
               return res.status(503).render("error", {"message": "Service unavailable"})

             result = []

             _.each(results.results.bindings, function(binding) {

               var subjectLink = "";
               var subjectValue = binding.s.value;
               var predicateValue = binding.p.value;

               predicateValue = namespaceService.getPrefixForm(binding.p.value);

               if (binding.s.type == "uri") {
                 subjectLink = buildLinkURI(binding.s.value);
                 subjectValue = namespaceService.getPrefixForm(binding.s.value);
               }

               result.push({
                 predicate: predicateValue,
                 type: binding.s.type,
                 value: subjectValue,
                 link: subjectLink
               });
             });

             templateVariables.references = result;
             templateVariables.title = title;

            //  //@DEBUG
            //  var autRecSubjects = _.map(_.filter(templateVariables.resource,
            //    function(triple) {return triple.predicateUri == 'http://data.finlex.fi/schema/common/autRecSubject'}),
            //    'objectUri');
            //  templateVariables.resource = _.filter(templateVariables.resource, function(triple) {
            //    return triple.predicateUri != 'http://data.finlex.fi/schema/common/autRecSubject'
            //  });
             //
            //  templateVariables.resource.push({
            //    objectType: 'list',
            //    predicateLabel: 'http://data.finlex.fi/schema/common/autRecSubject',
            //    predicateUri: 'http://data.finlex.fi/schema/common/autRecSubject',
            //    objectUris: autRecSubjects
            //  });

             res.render('judgment', templateVariables);
         });
     });
  },


  /**
   * Find legal resource
   *
   * @param req request object
   * @param res response object
   * @param next callback
   *
   * @return resource
   */
   findLegalResource: function(req, res, next) {

     function buildLinkURI(uri) {
       return uri.replace("http://data.finlex.fi/", "/")
     }

     // Import modules
     var util = require('util');
     var _ = require('lodash')
     var sparqlService = require('../../services/sparql-service');
     var namespaceService = require('../../services/namespace-service');
     var sfService = require('../../services/sf-service');
     var sfUtils = require('../../services/sf-utils');

     // Check params
     req.checkParams('0', 'Invalid year').isInt();
     req.checkParams('1', 'Invalid statute identifier').isStatuteIdentifier();
     req.checkParams('2', 'Invalid statute item').optional().isStatuteItem();
     req.checkParams('3', 'Invalid statute version').optional().isStatuteVersion();
     req.checkParams('4', 'Invalid version date').optional().isPointInTime();

     var errors = req.validationErrors();
     if (errors) {
       return res.status(400).render("error", {"message": util.inspect(errors)});
     }

     var isVersionRequest = true;
     if(!req.params[3]) {
       req.params[3] = "ajantasa";
       isVersionRequest = false
     }

     // Default format
     var contentType = 'application/ld+json';
     //var contentType = 'application/sparql-results+json';

     var subject = "<http://data.finlex.fi/eli/sd/" + req.params[0] + "/" +
       req.params[1] + req.params[2] + ">";
     var language = (req.headers['accept-language'].lastIndexOf("sv-SE", 0) === 0) ? "swe" : "fin";

     var versionFilter = (req.params[3] == "alkup") ?
       "FILTER(REGEX(STR(?v), \"alkup\", \"i\"))" : "";

     var pointInTime = (req.params[4]) ?
       req.params[4].slice(0,4) + "-" + req.params[4].slice(4,6) +
         "-" + req.params[4].slice(6,8) : null;
     var timeFilter = pointInTime ? "FILTER (!BOUND(?dv) || \"" + pointInTime +"\"^^xsd:date >= ?dv)" : "";
     // Build SPARQL query string
     //var query = "SELECT * WHERE { VALUES ?s {" + subject + "}"+
     //  "?s ?p ?o } ORDER BY ?p";
     var query = "CONSTRUCT {\n" +
       //"?s ?ps ?os .\n"+
       "?v ?pv ?ov ;\n"+
       "eli:title ?title ;\n" +
       "sfl:html ?content .\n" +
       "?kw rdf:type ?kw_type ;\n"+
       "skos:prefLabel ?lbl ;\n"+
       "rdf:type skos:Concept .\n" +
       "}\n" +
       "WHERE {\n" +
       //"?s ?ps ?os .\n" +
       "{\n" +
         "SELECT ?v WHERE {\n" +
           subject + " eli:has_member ?v .\n" +
           "OPTIONAL{?v eli:version_date ?dv .}\n" +
           versionFilter +
           timeFilter +
         "} ORDER BY DESC(?dv) LIMIT 1\n" +
       "}\n" +
       "BIND(IRI(CONCAT(str(?v),\"/" + language + "\")) AS ?expression) \n" +
       "BIND(IRI(CONCAT(str(?v),\"/" + language + "/html\")) AS ?format) \n" +
       "?v ?pv ?ov .\n " +
       "OPTIONAL { ?expression eli:title ?title . }\n" +
       "OPTIONAL { ?format sfl:html ?content . } \n" +
       "OPTIONAL {?v eli:is_about ?kw . ?kw skos:prefLabel ?lbl . ?kw a ?kw_type .}" +
     "}";

     // Init SPARQL client
     var client = sparqlService.initClient(contentType);

     // Log SPARQL query
     sparqlService.logQuery(query);

     client.query(sparqlService.getPrefixes() + query)
       .execute(function(error, results) {
         if (!results)
           return res.status(404).render("error", {"message": "Resource not found."});
         //console.log(req.get('Accept'));
         if (req.get('Accept').indexOf('html') < 0) {
           return res.send(results);
         }
         var jsonldService = require('../../services/jsonld-service');
         var results = jsonldService.organize(results)
         var title = results["@graph"][0].title;
         var html = results["@graph"][0].html;
         var titleVal = (!title) ? "" : title['@value'];
         var htmlVal = (!html) ? "" : html['@value'];
         var metadata = jsonldService.filterMetadata(results["@graph"][0])
         var templateVariables = {
           tagcloud: "http://data.finlex.fi/tagclouds/cloud_data.finlex.fi_eli_sd_"+req.params[0]+"_"+req.params[1]+".png",
           title: titleVal,
           html: htmlVal
         };
         console.log(results["@graph"][0])

         var version = isVersionRequest ? results["@graph"][0]["@id"] : results["@graph"][0]["is_member_of"];

         // Build SPARQL query string
         var query = "SELECT * WHERE { <" + version + "> ?p ?o } ORDER BY ?p";

         var contentType = 'application/sparql-results+json';
         var client = sparqlService.initClient(contentType);
         // Log SPARQL query
         sparqlService.logQuery(query);
         client.query(sparqlService.getPrefixes() + query)
           .execute(function(error, results) {
             if (!results || !results.results)
               return res.status(404).render("error", {"message": "Resource not found."});
             var result = []
             _.each(results.results.bindings, function(binding) {
               var objectUri = "";
               var objectLabel = binding.o.value;
               var objectType = binding.o.type;
               var predicateLabel = namespaceService.getPrefixForm(binding.p.value);

               if (objectType == "uri") {
                 objectUri = binding.o.value;
                 objectLabel = namespaceService.getPrefixForm(binding.o.value);
               }
               if (binding.o.datatype=="http://www.w3.org/2001/XMLSchema#date")
                 objectType = "date"

               result.push({
                 predicateLabel: predicateLabel,
                 predicateUri: binding.p.value,
                 objectType: objectType,
                 objectLabel: objectLabel,
                 objectUri: objectUri
               });
             });

             //@DEBUG
             //console.log(result)

             templateVariables.subject = "<"+version+">";
             templateVariables.subjectUri = version;
             templateVariables.resource = result;
             if (metadata['@id'] !== undefined) {
               templateVariables.statuteItemId = sfUtils.getStatuteItemId(metadata['@id']);
               var versionDate = sfUtils.getVersionDate(metadata['@id']);
               templateVariables.statutetext = (language == "swe") ? "Författning" : "Säädös";
               templateVariables.versiontext = (language == "swe") ? "Trädde i kraft" : "Voimassa";
               templateVariables.versiondate = parseInt(versionDate) ? versionDate.substring(0,4)+'-'+versionDate.substring(4,6)+'-'+versionDate.substring(6,8) : versionDate;
             }
             // Build SPARQL query string
             var query = "SELECT * WHERE { VALUES ?o {<" + version + ">}"+
               "?s ?p ?o } ORDER BY ?p";
             // Init SPARQL client
             var contentType = 'application/sparql-results+json';
             var client = sparqlService.initClient(contentType);
             // Log SPARQL query
             sparqlService.logQuery(query);
             client.query(sparqlService.getPrefixes() + query)
               .execute(function(error, results) {
                 if (!results || !results.results)
                   return res.status(404).render("error", {"message": "Resource not found."});
                 templateVariables.references = sparqlService.organizeResults(results);
                 sfService.findChangedByStatutes(metadata['@id'])
                   .then(function(arr) {
                     templateVariables.changedBy = arr;
                     return sfService.findRelatedStatutes(metadata['@id'])
                   })
                   .then(function(arr) {
                     templateVariables.cites = arr;
                     return sfService.findRelatedJudgements(sfUtils.getWorkURI(metadata['@id']))
                   })
                   .then(function(arr) {
                     templateVariables.judgements = arr;
                     return sfService.findTransposed(metadata['@id'])
                   })
                   .then(function(arr) {
                     var cellarService = require('../../services/cellar-service');
                     templateVariables.transposes = arr;
                     return cellarService.findTitlesByELIs(_.map(templateVariables.transposes, 'uri'));
                   })
                   .then(function(arr) {
                     templateVariables.transposes = arr;
                     return sfService.findFinlexConceptLabels(metadata['@id'])
                   })
                  .then(function(arr) {
                      var cellarService = require('../../services/cellar-service');
                      //templateVariables.mentionsEuroVocLaw = arr;
                      return cellarService.findDocsByConceptLabels(arr);
                    })
                    .then(function(arr) {
                     templateVariables.mentionsEuroVocLaw = arr;
                     console.log(arr);
                     return res.render('legal-resource', templateVariables);
                   })
                   .catch(function(err) {
                     console.log(err);
                     return res.status(404).render("error", {"message": "Resource not found."});
                   });
             });
       });
     });
  },



 /**
  * Find one resource by URI path
  *
  * @param req request object
  * @param res response object
  * @param next callback
  *
  * @return resource
  */
  findResource: function(req, res, next) {

    function buildLinkURI(uri) {

      return uri.replace("http://data.finlex.fi/", "/")

    }

    // Import modules
    var _ = require('lodash')
    var sparqlService = require('../../services/sparql-service');
    var namespaceService = require('../../services/namespace-service');

    // Default format
    var contentType = 'application/sparql-results+json';

    var subject = "<http://data.finlex.fi" + req.originalUrl + ">"

    // Build SPARQL query string
    var query = "SELECT * WHERE { " + subject + " ?p ?o } ORDER BY ?p";

    // Init SPARQL client
    var client = sparqlService.initClient(contentType);

    // Log SPARQL query
    sparqlService.logQuery(query);

    client.query(sparqlService.getPrefixes() + query)
      .execute(function(error, results) {

        if (!results || !results.results)
          return res.status(503).render("error", {"message": "Service unavailable"})

        var result = []
        _.each(results.results.bindings, function(binding) {
          var objectUri = "";
          var objectLabel = binding.o.value;
          var objectType = binding.o.type;
          var predicateLabel = namespaceService.getPrefixForm(binding.p.value);

          if (objectType == "uri") {
            objectUri = binding.o.value;
            objectLabel = namespaceService.getPrefixForm(binding.o.value);
          }

          result.push({
            predicateLabel: predicateLabel,
            predicateUri: binding.p.value,
            objectType: binding.o.type,
            objectLabel: objectLabel,
            objectUri: objectUri
          });
        });

        //@DEBUG
        //console.log(result)

        var templateVariables = {
          subject: subject,
          subjectUri: subject.substring(1, subject.length-1),
          resource: result
        };

        // Build SPARQL query string
        query = "SELECT * WHERE { ?s ?p " + subject + " } ORDER BY ?p";

        // Init SPARQL client
        var client = sparqlService.initClient(contentType);

        // Log SPARQL query
        sparqlService.logQuery(query);

        client.query(sparqlService.getPrefixes() + query)
          .execute(function(error, results) {

            if (!results || !results.results)
              return res.status(503).render("error", {"message": "Service unavailable"})

            result = []

            _.each(results.results.bindings, function(binding) {
              var subjectLink = "";
              var subjectValue = binding.s.value;
              var predicateValue = binding.p.value;

              predicateValue = namespaceService.getPrefixForm(binding.p.value);

              if (binding.s.type == "uri") {
                subjectLink = buildLinkURI(binding.s.value);
                subjectValue = namespaceService.getPrefixForm(binding.s.value);
              }

              result.push({
                predicate: predicateValue,
                type: binding.s.type,
                value: subjectValue,
                link: subjectLink
              });
            });

            templateVariables.references = result;
            templateVariables.title = subject;

            //@DEBUG
            var autRecSubjects = _.map(_.filter(templateVariables.resource,
              function(triple) {return triple.predicateUri == 'http://data.finlex.fi/schema/common/autRecSubject'}),
              'objectUri');
            templateVariables.resource = _.filter(templateVariables.resource, function(triple) {
              return triple.predicateUri != 'http://data.finlex.fi/schema/common/autRecSubject'
            });

            templateVariables.resource.push({
              objectType: 'list',
              predicateLabel: 'http://data.finlex.fi/schema/common/autRecSubject',
              predicateUri: 'http://data.finlex.fi/schema/common/autRecSubject',
              objectUris: autRecSubjects
            });

            res.render('ld-browser', templateVariables);
        });
    });
  },


  /**
   * Find judgments
   *
   * @param req request object
   * @param res response object
   * @param next callback
   *
   * @return resource
   */
   findJudgments: function(req, res, next) {

     function getCourtByName(name) {
       switch (name) {
         case 'kko':
          return 'http://data.finlex.fi/common/KKO';
          break;
         case 'kko':
          return 'http://data.finlex.fi/common/KHO';
          break;
        default:
          return "";
          break;
       }
     }

     function buildLinkURI(uri) {
      return uri.replace("http://data.finlex.fi/", "/")
     }

     // Import modules
     var _ = require('lodash')
     var sparqlService = require('../../services/sparql-service');
     var namespaceService = require('../../services/namespace-service');

     // Check params
     req.checkParams('0', 'Invalid year').optional().isInt();
     req.checkParams('1', 'Invalid court name').isCourt();

     // Default format
     var contentType = 'application/sparql-results+json';

     // Build SPARQL query string
     var query = "SELECT DISTINCT ?j ?id ?t "+
       "WHERE { ?j rdf:type sfcl:Judgment ."+
       // Judgments by court
       ((req.params[0]) ? '?j dcterms:creator <'+getCourtByName(req.params['0'])+">." : "")+
       // Judgments by year
       ((req.params[1]) ? "?j dcterms:date ?date .FILTER(year(?date) = "+parseInt(req.params[1])+")" : "")+
       "?j dcterms:isVersionOf ?id ."+
       (req.query.year!=undefined ? "FILTER(REGEX(STR(?id), \"\/"+req.query.year+"\", \"i\")) " : "")+
       "?j sfcl:isRealizedBy ?e."+
       "?e dcterms:title ?t ."+
       "?e dcterms:language "+
       ((req.headers['accept-language'].lastIndexOf("sv-SE", 0) === 0) ? "\"sv\"" : "\"fi\"")+". "+
       "}"+
       (req.query.year!=undefined ? "LIMIT 10" : " LIMIT 50");

     // Init SPARQL client
     var client = sparqlService.initClient(contentType);

     // Log SPARQL query
     sparqlService.logQuery(sparqlService.getPrefixes() + query);

     client.query(sparqlService.getPrefixes() + query)
      .execute(function(error, results) {

        if (!results || !results.results)
          return res.status(503).render("error", {"message": "Service unavailable"})

        var result = []
        var templateVariables = {};
        templateVariables.title = ((req.headers['accept-language'].lastIndexOf("sv-SE", 0) === 0) ? "Avgöranden ":"Oikeuden ratkaisut ")+
        (req.query.year!=undefined ? "("+req.query.year+")" : "");

        //@DEBUG
        templateVariables.resources = _.map(results.results.bindings, function(binding) {
          return { uri: binding.j.value, id: binding.id.value, title: binding.t.value };
        });

        res.render('ld-browser-list', templateVariables);
     });
   },


 /**
  * Find statutes
  *
  * @param req request object
  * @param res response object
  * @param next callback
  *
  * @return resource
  */
  findStatutes: function(req, res, next) {

    function buildLinkURI(uri) {
     return uri.replace("http://data.finlex.fi/", "/")
    }

    // Import modules
    var _ = require('lodash')
    var sparqlService = require('../../services/sparql-service');
    var namespaceService = require('../../services/namespace-service');

    // Default format
    var contentType = 'application/sparql-results+json';

    // Build SPARQL query string
    var query = "SELECT DISTINCT ?s ?id ?t "+
      "WHERE { ?s rdf:type sfl:Statute ."+
      "?s eli:id_local ?id ."+
      (req.query.year!=undefined ? "FILTER(REGEX(STR(?id), \"\/"+req.query.year+"\", \"i\")) " : "")+
      "?s eli:has_member ?v ."+
      "?v eli:is_realized_by ?e."+
      "?e eli:title ?t ."+
      "?e eli:language "+
      ((req.headers['accept-language'].lastIndexOf("sv-SE", 0)  === 0) ? "<http://publications.europa.eu/resource/authority/language/SWE>" : "<http://publications.europa.eu/resource/authority/language/FIN>")+". "+
      "}"+
      (req.query.year!=undefined ? "LIMIT 10" : " LIMIT 50");

    // Init SPARQL client
    var client = sparqlService.initClient(contentType);

    // Log SPARQL query
    sparqlService.logQuery(sparqlService.getPrefixes() + query);

    client.query(sparqlService.getPrefixes() + query)
     .execute(function(error, results) {

       if (!results || !results.results)
         return res.status(503).render("error", {"message": "Service unavailable"})

       var result = []
       var templateVariables = {};
       templateVariables.title = ((req.headers['accept-language'].lastIndexOf("sv-SE", 0)  === 0) ? "Författningar ":"Säädökset ")+
       (req.query.year!=undefined ? "("+req.query.year+")" : "");

       //@DEBUG
       templateVariables.resources = _.map(results.results.bindings, function(binding) {
         return { uri: binding.s.value, id: binding.id.value, title: binding.t.value };
       });

       res.render('ld-browser-list', templateVariables);
    });
  },



  /**
  * Find manifestation plain text
  *
  * @param req request object
  * @param res response object
  * @param next callback
  *
  * @return resource text
  */
  findText: function(req, res, next) {

    // Import modules
    var _ = require('lodash')
    var sparqlService = require('../../services/sparql-service');

    // Default format
    var contentType = 'application/sparql-results+json';

    var subject = "<http://data.finlex.fi" + req.originalUrl.replace(".txt", "/txt") + ">"

    var sfl = sparqlService.getNamespaceUri("sfl");
    var sfcl = sparqlService.getNamespaceUri("sfcl");
    var predicate = (req.originalUrl.indexOf('/eli/sd/') > -1 ) ?
        "<"+sfl+"text>" : "<"+sfcl+"text>";

    // Build SPARQL query string
    var query = "SELECT * WHERE { " + subject + " " + predicate + " ?o }";

    // Init SPARQL client
    var client = sparqlService.initClient(contentType);

    // Log SPARQL query
    sparqlService.logQuery(query);

    client.query(sparqlService.getPrefixes() + query)
      .execute(function(error, results){
        res.set('Content-Type', 'text/plain');
        //return res.send(results);

        if (!results || !results.results)
          return res.send("Service unavailable", 503)

        var txt = results.results.bindings[0] ? results.results.bindings[0].o.value : "";

        res.send(txt);

      });
  },



 /**
  * Find manifestation xml
  *
  * @param req request object
  * @param res response object
  * @param next callback
  *
  * @return resource text
  */
  findXml: function(req, res, next) {

    // Import modules
    var _ = require('lodash')
    var sparqlService = require('../../services/sparql-service');

    // Default format
    var contentType = 'application/sparql-results+json';

    var subject = "<http://data.finlex.fi" + req.originalUrl.replace(".xml", "/xml") + ">"

    var sfl = sparqlService.getNamespaceUri("sfl");
    var sfcl = sparqlService.getNamespaceUri("sfcl");
    var predicate = (req.originalUrl.indexOf('/eli/sd/') > -1 ) ?
        "<"+sfl+"xml>" : "<"+sfcl+"xml>";

    // Build SPARQL query string
    var query = "SELECT * WHERE { " + subject + " " + predicate + " ?o }";

    // Init SPARQL client
    var client = sparqlService.initClient(contentType);

    // Log SPARQL query
    sparqlService.logQuery(query);

    client.query(sparqlService.getPrefixes() + query)
      .execute(function(error, results){
        res.set('Content-Type', 'text/plain');
        //return res.send(results);

        if (!results || !results.results)
          return res.send("Service unavailable", 503)

        var xml = results.results.bindings[0] ? results.results.bindings[0].o.value : "";

        res.send(xml);

      });
  }


};


module.exports = self;
