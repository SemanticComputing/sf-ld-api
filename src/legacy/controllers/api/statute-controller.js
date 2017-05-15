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

    var query = sparqlService.getPrefixes() + 'SELECT DISTINCT ?c ?l ?s ?t ?title ?txt ?score ?matchType WHERE {\n'+
    '     {\n'+
//    '        ?c text:query (skos:prefLabel \''+req.query.query+'*\' 20) . \n'+
    '        ?c a skos:Concept .\n'+
//    '        FILTER(regex(str(?c), "/finlex/" ) )\n'+
    '        ?c skos:prefLabel ?l .\n'+
    '        FILTER(regex(LCASE(str(?l)), LCASE(\''+regexQuery+'\') ) )\n'+
    '        FILTER(LANG(?l) = '+ (lang=='sv' ? '\'sv\'' : '\'fi\'')+') \n'+
    '        VALUES ?score {100}\n'+
    '        VALUES ?matchType {\'keyword\'}\n'+
    '        ?s eli:has_member ?v.\n'+
    '        ?v eli:is_about ?c .\n'+
    '        ?v eli:is_realized_by ?e .\n'+
    '        ?e eli:language '+ (lang=='sv' ? '<http://publications.europa.eu/resource/authority/language/SWE>' : '<http://publications.europa.eu/resource/authority/language/FIN>')+'. \n'+
    '        ?e eli:title ?title .\n'+
    '      } UNION {\n'+
//     '        ?c a skos:Concept .\n'+
// //    '        FILTER(regex(str(?c), "/finlex/" ) )\n'+
//     '        ?c skos:prefLabel ?l .\n'+
//     '        FILTER(regex(LCASE(str(?l)), LCASE(\''+regexQuery+'\') ) )\n'+
//     '        FILTER(LANG(?l) = \'fi\')\n'+
//     '        VALUES ?score {50}\n'+
//     '        VALUES ?matchType {\'keyword\'}\n'+
//     '        ?s sfl:hasVersion ?v.\n'+
//     '        ?s common:mentionsEuroVocLaw ?c .\n'+
//     '        ?v eli:is_realized_by ?e .\n'+
//     '        ?e eli:language <http://publications.europa.eu/resource/authority/language/FIN> .\n'+
//     '        ?e eli:title ?title .\n'+
//     '      } UNION {\n'+
    // '        (?e ?score) text:query (eli:title \'"'+req.query.query+'"\' 20) . \n'+
    // '        ?s sfl:hasVersion ?v. \n'+
    // '        ?v eli:is_realized_by ?e .\n'+
    // '        ?e eli:is_embodied_by ?f .\n'+
    // '        ?f sfl:text ?txt .\n'+
    // '        ?e eli:title ?title .\n'+
    // '        VALUES ?matchType {\'title\'}\n'+
    // '        ?s rdf:type ?t .\n'+
    // '      } UNION {\n'+
    // '        (?f ?score) text:query (sfl:text \'"'+req.query.query+'"\' 20) . \n'+
    // '        ?s sfl:hasVersion ?v. \n'+
    // '        ?v eli:is_realized_by ?e .\n'+
    // '        ?e eli:is_embodied_by ?f .\n'+
    // '        ?f sfl:text ?txt .\n'+
    // '        VALUES ?matchType {\'content\'}\n'+
    // '        ?s rdf:type ?t .\n'+
    // '        FILTER (?t NOT IN ( sfl:Statute , sfl:Chapter, sfl:Part, sfl:Paragraph, sfl:Subparagraph))\n'+
    // '        OPTIONAL { ?e eli:title ?title } .\n'+
    //     '      } UNION {\n'+
    '        (?e ?score) text:query (eli:title \''+req.query.query+'*\' 20) . \n'+
    '        ?s eli:has_member ?v. \n'+
    '        ?v eli:is_realized_by ?e .\n'+
    '        ?e eli:is_embodied_by ?f .\n'+
    '        ?f sfl:text ?txt .\n'+
    // '        ?e eli:language '+ (lang=='sv' ? '<http://publications.europa.eu/resource/authority/language/SWE>' : '<http://publications.europa.eu/resource/authority/language/FIN>')+'. \n'+
    '        ?e eli:title ?title .\n'+
    '        VALUES ?matchType {\'title\'}\n'+
    '        ?s rdf:type ?t .\n'+
    '      } UNION {\n'+
    '        (?f ?score) text:query (sfl:text \''+req.query.query+'*\' 20) . \n'+
    '        ?s eli:has_member ?v. \n'+
    '        ?v eli:is_realized_by ?e .\n'+
    // '        ?e eli:language '+ (lang=='sv' ? '<http://publications.europa.eu/resource/authority/language/SWE>' : '<http://publications.europa.eu/resource/authority/language/FIN>')+'. \n'+
    '        ?e eli:is_embodied_by ?f .\n'+
    '        ?f sfl:text ?txt .\n'+
    '        VALUES ?matchType {\'content\'}\n'+
    '        ?s rdf:type ?t .\n'+
    '        FILTER (?t NOT IN ( sfl:Statute , sfl:Chapter, sfl:Part, sfl:Paragraph, sfl:Subparagraph))\n'+
    '        OPTIONAL { ?e eli:title ?title } .\n'+
    '      }\n'+
    '    } GROUP BY ?s ?c ?l ?t ?title ?txt ?score ?matchType ORDER BY DESC(?score)';//' LIMIT '+(req.query.limit!=undefined ? req.query.limit : '5');

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
            title: (binding.title != undefined) ? binding.title.value : '',
            txt: (binding.txt != undefined) ? binding.txt.value : '',
          })
          if (binding.matchType.value=='keyword')
            autoC.push({
              label: binding.l.value.toLowerCase(),
              type: 'keyword'
            });
          else if (binding.matchType.value=='title') {
            autoC.push({
              label: binding.title.value.toLowerCase(),
              type: 'title'
            });
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
  * Find statutes
  *
  * @param req request object
  * @param res response object
  * @param next callback
  *
  * @return list of statutes
  */
  find: function(req, res, next) {

   // Import modules
   var _ = require('lodash');
   var util = require('util');
   var sparqlService = require('../../services/sparql-service');

   req.checkParams('year', 'Invalid year').optional().isInt();
   req.checkQuery('limit', 'Invalid limit').optional().isInt();
   req.checkQuery('language', 'Invalid limit').optional().isLanguage();
   req.checkQuery('format', 'Invalid format').optional().isFormat();

   var errors = req.validationErrors();
   if (errors) {
     res.send('Invalid query: ' + util.inspect(errors), 400);
     return;
   }

   if (req.query.query) return self.findByQuery(req,res,next);

   // Resolve format / content type and query type
   //var contentType = sparqlService.resolveContentType(req.query.format);
   var contentType = "application/ld+json"
   var queryType = sparqlService.resolveQueryType(contentType);
   var responseType = sparqlService.resolveResponseType(contentType);

   // Get namespace URIs
   var eli = sparqlService.getNamespaceUri("eli");
   var sfl = sparqlService.getNamespaceUri("sfl");
   var rdf = sparqlService.getNamespaceUri("rdf");

   var limit = (req.query.limit) ? req.query.limit : 100;
   // Resolve Query parameters
   var language = (req.query.language) ? req.query.language : "fi";
   var eliLanguage = (language == "fi") ? "fin" : "swe";
   //var content = (req.query.content) ? req.query.content : "txt";

   // Filter by year
   var filter = (req.param('year')) ?
    "?s eli:id_local ?id_local .\n" +
    "FILTER regex(?id_local, \"" + req.param('year') + "$\", \"i\")"
    : "";

   // Build SPARQL query string
   var queries = {
     'construct':
       "CONSTRUCT { ?s <" + rdf + "type>  <" + sfl + "Statute> . ?s eli:title ?t . } WHERE \n" +
         "{ ?s <" + rdf + "type> <" + sfl + "Statute> .\n " +
         filter +
         "?s <"+eli+"has_member> ?v ."+
         "BIND(IRI(CONCAT(str(?v),\"/"+eliLanguage+"\")) AS ?e)\n"+
         "?e eli:title ?t .\n" +
       "} LIMIT "+limit+"\n"
   }

   var query = queries[queryType];

   // Init SPARQL client
   var client = sparqlService.initClient(contentType);

   // Log SPARQL query
   sparqlService.logQuery(query);

   client.query(sparqlService.getPrefixes() + query)
     .execute(function(error, results) {
       res.set('Content-Type', responseType);
       //console.log(results);
       if (error||!results)
         return res.send("Service unavailable", 500);
       if (!results["@graph"])
         return res.send("Not found", 404);
       var jsonldService = require('../../services/jsonld-service');
       var results = jsonldService.organize(results)
       results["@graph"] = _.each(results["@graph"], function(s,i,r) {
         s["title_"+language] = s["title"];
         delete s["title"];
         console.log(s);
       });
       results["@context"]["title_"+language] = results["@context"]["title"];
       delete results["@context"]["title"];
       return res.send(req.query.pretty!=undefined ? JSON.stringify(results, null, 2) : results);
     });
  },

 /**
  * Find one statute
  *
  * @param req request object
  * @param res response object
  * @param next callback
  *
  * @return case document
  */
  findOne: function(req, res, next) {

    // Import modules
    var _ = require('lodash')
    var util = require('util');
    var languageService = require('../../services/language-service');
    var namespaceService = require('../../services/namespace-service');
    var sparqlService = require('../../services/sparql-service');

    // Check params
    req.checkParams('year', 'Invalid year').isInt();
    req.checkParams('id', 'Invalid statute identifier').isStatuteIdentifier();
    req.checkParams('0', 'Invalid statute item').isStatuteItem();
    req.checkQuery('language', 'Invalid language').optional().isLanguage();
    req.checkQuery('format', 'Invalid format').optional().isFormat();
    req.checkQuery('content', 'Invalid content type').optional().isContentType();
    req.checkQuery('versiondate', 'Invalid version date').optional().isPointInTime();

    var errors = req.validationErrors();
    if (errors) {
      res.send('Invalid query: ' + util.inspect(errors), 400);
      return;
    }

    // Resolve format / content type and query type
    //var contentType = sparqlService.resolveContentType(req.query.format);
    var contentType = "application/sparql-results+json"
    var queryType = sparqlService.resolveQueryType(contentType);
    var responseType = sparqlService.resolveResponseType(contentType);

    // Get namespace URIs
    var legislation = namespaceService.legislation;
    var eli = sparqlService.getNamespaceUri("eli");
    var sfl = sparqlService.getNamespaceUri("sfl");
    var xsd = sparqlService.getNamespaceUri("xsd");

    var pointInTime = (req.query.versiondate) ?
      req.query.versiondate.slice(0,4) + "-" + req.query.versiondate.slice(4,6) +
        "-" + req.query.versiondate.slice(6,8) : null;
    var timeFilter = pointInTime ? "FILTER (!BOUND(?dv) || \"" + pointInTime +"\"^^<"+xsd+"date> > ?dv)" : "";

    // Resolve Query parameters
    var version = (req.query.version) ? req.query.version : "ajantasa";
    var language = (req.query.language) ?
      languageService.getThreeLetterCodeByTwoLetterCode(req.query.language) : "fin";
    var content = (req.query.content) ? req.query.content : "txt";
    var contentPred = (content == "txt") ? sfl + "text" : sfl + content;
    var statuteItem = legislation +
      req.param('year') + "/" + req.param('id') + req.param('0');

    // Build SPARQL query string
    /*var queries = {
      "construct":
        "CONSTRUCT { ?s ?p ?o . ?s <" + eli + "title> ?title . " +
          "?s <" + contentPred + "> ?content . }" +
          "WHERE {" +
          "{" +
            "SELECT ?s WHERE {" +
              "<" + statuteItem + "> <" + sfl + "hasVersion> ?s ." +
              "OPTIONAL{?s <" + eli + "version_date> ?dv .}" +
              timeFilter +
            "} ORDER BY DESC(?dv) LIMIT 1" +
          "}" +
          "BIND(IRI(CONCAT(str(?s),\"/" + language + "\")) AS ?expression) " +
          "BIND(IRI(CONCAT(str(?s),\"/" + language + "/" + content +"\")) AS ?format) " +
          "?s ?p ?o . " +
          "{ ?expression <" + eli + "title> ?title . }" +
          "UNION { ?format <" + contentPred + "> ?content . } " + // @TODO OPTIONAL {}
        "}",
      "select": ""
    }

    var query = queries[queryType]; */
    var query =
      "SELECT * {" +
        "{"+
          "SELECT ?s {"+
            (req.query.free!=undefined ? "GRAPH <http://data.finlex.fi/sd/alkup> {" : "")+
            "<" + statuteItem + "> <" + eli + "has_member> ?s ."+
            "OPTIONAL {"+
              "?s <"+eli+"version_date> ?dv ."+
            "}"+
            timeFilter+
            (req.query.free!=undefined ? "}" : "")+
          "} ORDER BY DESC(?dv) LIMIT 1"+
        "}"+
        (req.query.free!=undefined ? "GRAPH <http://data.finlex.fi/sd/alkup> {" : "")+
        (req.query.tree!=undefined ? "?s <"+eli+"has_part>* ?s2 ." : "BIND(?s AS ?s2)")+
        "{"+
          "?s2 ?p ?o ."+
          "FILTER (?p!=<"+eli+"is_part_of>)"+
          "FILTER (?p!=<"+eli+"is_realized_by>)"+
        "} UNION {"+
          "BIND(IRI(CONCAT(str(?s2),\"/"+language+"\")) AS ?expression)"+
          "?expression <"+eli+"title> ?title ."+
        "} UNION {"+
          "BIND(IRI(CONCAT(str(?s2),\"/"+language+"\")) AS ?expression)"+
          "BIND(IRI(CONCAT(str(?s2),\"/" + language + "/" + content +"\")) AS ?format)"+
          (req.query.tree!=undefined ? "FILTER NOT EXISTS {"+
            "?s2 <"+eli+"has_part> _:b ."+
          "}" : "")+
          "?format <"+contentPred+"> ?content . "+
        "}"+
        (req.query.free!=undefined ? "}" : "")+
      "} ORDER BY DESC(IF(BOUND(?title),<"+sfl+"z>,?p))";

    // Init SPARQL client
    var client = sparqlService.initClient(contentType);

    // Log SPARQL query
    sparqlService.logQuery(query);

    client.query(query)
      .execute(function(error, results) {
        res.set('Content-Type', responseType);
        if (results.results.bindings.length==0)
          return res.send("Not found", 404)
        var prefixes = {
          'http://www.w3.org/2001/XMLSchema#' : 'xsd',
        }
        prefixes[sfl]='sfl'
        prefixes[eli]='eli'
        var shorten = function(uri) {
          for (var ns in prefixes) {
            if (uri.indexOf(ns)==0)
              return prefixes[ns]+':'+uri.substr(ns.length)
          }
          return uri
        }
        var context = {
          "is_realized_by": { "@id": "eli:is_realized_by", "@type":"@id"},
          "is_embodied_by": { "@id": "eli:is_embodied_by", "@type":"@id"}
        }
        var itemMap = {}
        results.results.bindings.forEach(function(binding){
          if (!itemMap[binding.s2.value]) itemMap[binding.s2.value]={'@id':shorten(binding.s2.value)}
          var currentSubject = itemMap[binding.s2.value]
          if (binding.p) {
            var prop = binding.p.value.replace(/.*[\/#]/,'') + (binding.o['xml:lang'] ? '_'+binding.o['xml:lang'] : '')
            var pprop = shorten(binding.p.value)
            if (prop=='type') prop='@type'
            if (!currentSubject[prop]) currentSubject[prop] = []
            currentSubject[prop].push(binding.o.value)
            if (!context[prop]) {
              if (binding.o.type=='uri')
                context[prop]= { "@id": pprop, "@type": "@id" }
              else if (binding.o['xml:lang'])
                context[prop+'_'+binding.o['xml:lang']]= { "@id": pprop, "@language": binding.o['xml:lang'] }
              else if (binding.o['datatype'])
                context[prop]= { "@id": pprop, "@type": shorten(binding.o['datatype']) }
            }
          } else if (binding.title) {
            currentSubject['is_realized_by'] = [binding.expression.value]
            context['title_'+binding.title['xml:lang']]= { "@id": 'eli:title', "@language": binding.title['xml:lang'] }
            if (!itemMap[binding.expression.value]) itemMap[binding.expression.value]={'@id':shorten(binding.expression.value)}
            itemMap[binding.expression.value]['title_'+binding.title['xml:lang']]=[binding.title.value]
          } else if (binding.content) {
            currentSubject['is_realized_by'] = [binding.expression.value]
            context['content_'+binding.content['xml:lang']]= { "@id": 'eli:title', "@language": binding.content['xml:lang'] }
            if (!itemMap[binding.expression.value]) itemMap[binding.expression.value]={'@id':shorten(binding.expression.value)}
            itemMap[binding.expression.value]['is_embodied_by']=[binding.format.value]
            itemMap[binding.format.value]={'@id':shorten(binding.format.value)}
            itemMap[binding.format.value]['content_'+binding.content['xml:lang']]=[binding.content.value]
          }
        })
        for (var objectKey in itemMap) {
          var object = itemMap[objectKey]
          for (var property in object) if (property!='@id') {
            object[property].sort(function(a,b) {
              var an
              if (a.indexOf("/johdanto/")) an = 0
              else if (a.indexOf("/loppukappale/")) an = Number.MAX_VALUE
              else an = parseInt(a.replace(/\/ajantasa\/.*$|\/alkup$/,"").replace(/.*\//,""),10)
              var bn
              if (b.indexOf("/johdanto/")) bn = 0
              else if (b.indexOf("/loppukappale/")) bn = Number.MAX_VALUE
              else bn = parseInt(b.replace(/\/ajantasa\/.*$|\/alkup$/,"").replace(/.*\//,""),10)
              return an-bn
            })
            var subheadings = object[property].filter(function(value) {
              return itemMap[value] && itemMap[value].nextItem
            })
            subheadings.forEach(function(sh) {
              object[property].splice(object[property].indexOf(sh),1)
              object[property].splice(object[property].indexOf(itemMap[sh].nextItem[0]),0,sh)
            })
            object[property] = object[property].map(function(value) {
              if (context[property]["@type"]!="@id") return value
              if (property!='nextItem' && itemMap[value]) return itemMap[value]
              return shorten(value)
            })
            if (object[property].length==1) object[property]=object[property][0]
          }
        }
        delete context['@type']
        for (var ns in prefixes)
          context[prefixes[ns]]=ns
        var response = itemMap[results.results.bindings[0].s.value]
        response['@context']=context
        /*var jsonldService = require('../../services/jsonld-service');
        var results = jsonldService.organize(results)*/
        return res.send(req.query.pretty!=undefined ? JSON.stringify(response, null, 2) : response);
      });
  }


}


module.exports = self;
