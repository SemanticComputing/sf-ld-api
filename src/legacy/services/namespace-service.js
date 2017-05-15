var self = {

  caselaw: "http://data.finlex.fi/oikeus/",
  legislation: "http://data.finlex.fi/eli/sd/",

  namespaces: {
    "common": "http://data.finlex.fi/schema/common/",
    "cdm": "http://publications.europa.eu/ontology/cdm#",
    "dcterms": "http://purl.org/dc/terms/",
    "eli": "http://data.europa.eu/eli/ontology#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "sfl": "http://data.finlex.fi/schema/sfl/",
    "sfcl": "http://data.finlex.fi/schema/sfcl/",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "text": "http://jena.apache.org/text#",
    "xsd": "http://www.w3.org/2001/XMLSchema#"
  },

  getPrefixForm: function(uri) {
    var prefixForm = uri;
    _ = require('lodash');
    _.each(self.namespaces, function(namespaceUri, index) {
      if (uri.indexOf(namespaceUri) > -1) {
        prefixForm = prefixForm.replace(namespaceUri, index + ":")
      }
    });
    return prefixForm;
  }

}

module.exports = self;
