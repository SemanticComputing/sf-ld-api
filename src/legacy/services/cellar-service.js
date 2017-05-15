var self = {

  query: function(query) {
    var Promise = require('bluebird');
    var _ = require('lodash');
    query = "prefix cdm: <http://publications.europa.eu/ontology/cdm#>\n" + query;
    var uri = "http://publications.europa.eu/webapi/rdf/sparql?default-graph-uri=&"+
      "query="+encodeURIComponent(query)+"&should-sponge=&format=application%2Fsparql-results%2Bjson&"+
      "timeout=5000&debug=on";
    //var uri = "http://publications.europa.eu/webapi/rdf/sparql?default-graph-uri=&query=prefix+cdm%3A+%3Chttp%3A%2F%2Fpublications.europa.eu%2Fontology%2Fcdm%23%3E%0D%0A%0D%0A%0D%0ASELECT+%3Fu+%3Ft+WHERE+{VALUES+%3Fu+{%22http%3A%2F%2Fdata.europa.eu%2Feli%2Fdir%2F2005%2F56%2Foj%22^^xsd%3AanyURI%0D%0A%22http%3A%2F%2Fdata.europa.eu%2Feli%2Fdir%2F2005%2F68%2Foj%22^^xsd%3AanyURI}%3Fw+a+cdm%3Awork+.%3Fw+cdm%3Aresource_legal_eli+%3Fu+.%3Fe+cdm%3Aexpression_belongs_to_work+%3Fw+.%3Fe+cdm%3Aexpression_uses_language+%3Chttp%3A%2F%2Fpublications.europa.eu%2Fresource%2Fauthority%2Flanguage%2FFIN%3E+.%3Fe+cdm%3Aexpression_title+%3Ft+.}&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on";
    return new Promise(function(resolve, reject) {
      var request = require('request');
      request({url:uri, headers: { 'User-Agent': 'request'}}, function(err, res, body) {
        var data;
        try {
          data = JSON.parse(body);
        }
        // Virtuoso server does not respond, cannot parse html response
        catch(err) {
          return resolve({});
        }
        if (err || !data.results) return reject (err);
        return resolve(data)
      });
    });
  },

  findDocsByConceptLabels: function(arr) {
    var Promise = require('bluebird');
    var _ = require('lodash');
    // var query = "SELECT ?u ?t\n"+
    //   "{\n";
    // _.each(arr, function(item,key) {
    //   query += "?w cdm:work_is_about_concept_eurovoc <"+item+">.\n";
    // });
    // query += "?w a cdm:work .\n" +
    //     "?w cdm:resource_legal_eli ?u .\n" +
    //     "?e cdm:expression_belongs_to_work ?w .\n" +
    //     "?e cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/FIN> .\n" +
    //     "?e cdm:expression_title ?t .\n" +
    //   "} LIMIT 2\n";

    // var query = "SELECT ?u ?t ?c ?cl\n"+
    //   "{\n";
    // _.each(arr, function(item,key) {
    //   query += "{ SELECT ?u ?t ?c ?cl WHERE {\n" +
    //     "?w cdm:work_is_about_concept_eurovoc <"+item+">.\n"+
    //     "<"+item+"> skos:prefLabel ?cl .\n"+
    //     "FILTER(lang(?cl) = 'fi')\n"+
    //     "?w a cdm:work .\n" +
    //     "?w cdm:resource_legal_eli ?u .\n" +
    //     "?e cdm:expression_belongs_to_work ?w .\n" +
    //     "?e cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/FIN> .\n" +
    //     "?e cdm:expression_title ?t .\n" +
    //     "BIND(<"+item+"> AS ?c)\n"+
    //   "} LIMIT 2\n";
    //   query += (key == arr.length-1) ? "}\n" : "} UNION\n";
    // })
    // query += "}";

    var query = "SELECT ?u ?t ?c ?cl\n"+
      "{\n";
    _.each(arr, function(item,key) {
      query += "{ SELECT ?u ?t ?c ?cl WHERE {\n" +
        "?w cdm:work_is_about_concept_eurovoc ?c . \n"+
        "?c skos:prefLabel '"+item.toLowerCase()+"'@fi .\n"+
        "?w a cdm:work .\n" +
        "?w cdm:resource_legal_eli ?u .\n" +
        "FILTER(regex(str(?u), '/(dir|reg)/')) \n"+
        "?e cdm:expression_belongs_to_work ?w .\n" +
        "?e cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/FIN> .\n" +
        "?e cdm:expression_title ?t .\n" +
        "BIND('"+item+"' AS ?cl)\n"+
      "} LIMIT 2\n";
      query += (key == arr.length-1) ? "}\n" : "} UNION\n";
    })
    query += "}";
    return new Promise(function(resolve, reject) {
      var sparql = require('./sparql-service');
      sparql.logQuery(query);
      self.query(sparql.getPrefixes() + query)
        .then(function(res) {
          // In case Cellar Virtuoso is not responding
          if (!res.results) return resolve([]);
          var resArr = {}
          //var resArr = []
          _.each(res.results.bindings, function(binding) {
            if (binding.t != undefined && binding.u != undefined && binding.c != undefined && binding.cl != undefined)
              if (resArr[binding.c.value] == undefined) resArr[binding.c.value] = {term: binding.cl.value, termUri: binding.c.value, docs: []};
              resArr[binding.c.value].docs.push({
                uri: binding.u.value,
                title: binding.t.value
              });
            // if (binding.t != undefined)
            //   resArr.push({
            //     uri: binding.u.value,
            //     title: binding.t.value
            //   });
          });
          return resolve(resArr);
        })
        .catch(function(err) {
          return reject(err)
      })
    });
  },

  findTitlesByELIs: function(uris) {
    var Promise = require('bluebird');
    var _ = require('lodash');
    var query = "SELECT ?u ?t WHERE {" +
      "VALUES ?u {" +
        "\"" + uris.join("\"^^xsd:anyURI\n\"") + "\"^^xsd:anyURI" +
        //"\"http://data.europa.eu/eli/dir/2005/56/oj\"^^xsd:anyURI"+
        //"\"http://data.europa.eu/eli/dir/2005/68/oj\"^^xsd:anyURI"+
      "}" +
      "?w a cdm:work ." +
      "?w cdm:resource_legal_eli ?u ." +
      "?e cdm:expression_belongs_to_work ?w ." +
      "?e cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/FIN> ." +
      "?e cdm:expression_title ?t ." +
    "}";
    return new Promise(function(resolve, reject) {
      var sparql = require('./sparql-service');
      sparql.logQuery(query);
      self.query(sparql.getPrefixes() + query)
        .then(function(res) {
          // In case Cellar Virtuoso is not responding
          if (!res.results) return resolve([]);
          var resArr = []
          _.each(res.results.bindings, function(binding) {
            if (binding.t)
              resArr.push({uri: binding.u.value, title: binding.t.value})
          });
          return resolve(resArr);
        })
        .catch(function(err) {
          return reject(err)
      })
    });
  }

}

module.exports = self;
