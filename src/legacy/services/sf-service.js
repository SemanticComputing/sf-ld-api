var self = {

  // find statutes that have amended uri
  findChangedByStatutes: function(uri) {
    var Promise = require('bluebird');
    var _ = require('lodash');
    var query = "SELECT DISTINCT ?s ?t WHERE {" +
	    "<" + uri + "> eli:has_part+ ?p ." +
   	  "{?p eli:changed_by ?s .}" +
      "UNION {<" + uri + "> eli:changed_by ?s .}" +
      "BIND(IRI(CONCAT(str(?s),\"/fin\")) AS ?e)" +
      "?e eli:title ?t ." +
    "}";
    return new Promise(function(resolve, reject) {
      var sparql = require('./sparql-service');
      sparql.logQuery(query);
      sparql.initClient("application/sparql-results+json")
        .query(sparql.getPrefixes() + query)
        .execute(function(err, res) {
          if (err || !res.results) return reject (err);
          var resArr = []
          _.each(res.results.bindings, function(binding) {
            if (binding.s && binding.t)
              resArr.push({uri: binding.s.value, title: binding.t.value})
          });
          return resolve(resArr);
      });
    });
  },

  // find statutes amended by uri
  findChangesStatutes: function() {

  },

  // find eurovoc concepts fo statute / item
  findEurovocConcepts: function(subject) {
    var Promise = require('bluebird');
    var _ = require('lodash');
    var query = "SELECT DISTINCT ?ev WHERE {\n"
	    + subject + " common:mentionsEuroVocLaw ?ev .\n" +
      "FILTER(regex(LCASE(str(?ev)), LCASE(\'europa\') ) )\n"+
    "}";
    return new Promise(function(resolve, reject) {
      var sparql = require('./sparql-service');
      sparql.logQuery(query);
      sparql.initClient("application/sparql-results+json")
        .query(sparql.getPrefixes() + query)
        .execute(function(err, res) {
          if (err || !res.results) return reject (err);
          var resArr = []
          _.each(res.results.bindings, function(binding) {
            if (binding.ev)
              resArr.push(binding.ev.value)
          });
          return resolve(resArr);
      });
    });
  },

  // find eurovoc concepts fo statute / item
  findFinlexConceptLabels: function(subject) {
    var Promise = require('bluebird');
    var _ = require('lodash');
    var query = "SELECT DISTINCT ?cl  WHERE {\n"+
      "<"+ subject + "> eli:is_about ?c .\n" +
      "FILTER(regex(LCASE(str(?c)), LCASE(\'/finlex/\') ) )\n"+
      "?c skos:prefLabel ?cl .\n"+
      "FILTER(lang(?cl) = 'fi') .\n"+
    "}";
    return new Promise(function(resolve, reject) {
      var sparql = require('./sparql-service');
      sparql.logQuery(query);
      sparql.initClient("application/sparql-results+json")
        .query(sparql.getPrefixes() + query)
        .execute(function(err, res) {
          if (err || !res.results) return reject (err);
          var resArr = []
          console.log(res)
          _.each(res.results.bindings, function(binding) {
            if (binding.cl)
              resArr.push(binding.cl.value)
          });
          return resolve(resArr);
      });
    });
  },

  findRepealsStatutes: function() {},
  findBasesOnStatutes: function() {},
  findBasisForStatutes: function() {},


  findTransposed: function(uri) {
    var Promise = require('bluebird');
    var _ = require('lodash');
    var query = "SELECT DISTINCT ?d WHERE {" +
      "<" + uri + "> eli:transposes ?d ." +
    "}";
    return new Promise(function(resolve, reject) {
      var sparql = require('./sparql-service');
      sparql.logQuery(query);
      sparql.initClient("application/sparql-results+json")
        .query(sparql.getPrefixes() + query)
        .execute(function(err, res) {
          if (err || !res.results) return reject (err);
          var resArr = []
          _.each(res.results.bindings, function(binding) {
            if (binding.d)
              resArr.push({uri: binding.d.value})
          });
          return resolve(resArr);
      });
    });
  },


  // find related judgements
  findRelatedJudgements: function(uri) {
    var Promise = require('bluebird');
    var _ = require('lodash');
    var query = "SELECT DISTINCT ?j ?ecli WHERE {" +
      "?j sfcl:referenceToLegislation <" + uri + "> ." +
      "?j dcterms:isVersionOf ?ecli ." +
    "}";
    return new Promise(function(resolve, reject) {
      var sparql = require('./sparql-service');
      sparql.logQuery(query);
      sparql.initClient("application/sparql-results+json")
        .query(sparql.getPrefixes() + query)
        .execute(function(err, res) {
          if (err || !res.results) return reject (err);
          var resArr = []
          _.each(res.results.bindings, function(binding) {
            if (binding.j && binding.ecli)
              resArr.push({uri: binding.j.value, ecli: binding.ecli.value})
          });
          return resolve(resArr);
      });
    });
  },

  // find cited statutes
  findRelatedStatutes: function(uri) {
    var Promise = require('bluebird');
    var _ = require('lodash');
    var query = "SELECT DISTINCT ?s (SAMPLE(?title) AS ?t) WHERE {" +
      "<" + uri + "> eli:has_part+ ?p ." +
      "{?p eli:cites ?s .}" +
      "UNION {<" + uri + "> eli:cites ?s .}" +
      "?s sfl:hasVersion ?v .\n" +
      "OPTIONAL{?v eli:version_date ?dv .}\n" +
      "BIND(IRI(CONCAT(str(?v),\"/fin\")) AS ?e) \n" +
      "?e eli:title ?title .\n" +
    "} GROUP BY ?s ?t";
    return new Promise(function(resolve, reject) {
      var sparql = require('./sparql-service');
      sparql.logQuery(query);
      sparql.initClient("application/sparql-results+json")
        .query(sparql.getPrefixes() + query)
        .execute(function(err, res) {
          if (err || !res.results) return reject (err);
          var resArr = []
          _.each(res.results.bindings, function(binding) {
            if (binding.s && binding.t)
              resArr.push({uri: binding.s.value, title: binding.t.value})
          });
          return resolve(resArr);
      });
    });
  }

}

module.exports = self;
