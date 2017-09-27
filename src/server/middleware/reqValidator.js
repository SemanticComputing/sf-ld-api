export default require('express-validator')({
  customValidators: {
    isContentType: function(value) {
      return (['txt', 'xml', 'html'].indexOf(value) > -1);
    },
    isCourt: function(value) {
      return (['kko', 'kho'].indexOf(value) > -1);
    },
    isECLI: function(value) {
      var matches = value.match(/ECLI:FI:(KKO|KHO):[0-9]{4}:(I|B|T){0,2}[0-9]{1,4}/g);
      var filtered = (matches != null) ? matches.join('') : '';
      return (value == filtered);
    },
    isFormat: function(value) {
      return (['json-ld', 'n-triples', 'rdf-json', 'rdf-xml', 'csv', 'json', 'xml'].indexOf(value) > -1);
    },
    isLanguage: function(value) {
      return (['fi', 'sv'].indexOf(value) > -1);
    },
    isPointInTime: function(value) {
      var matches = value.match(/[0-9]{8}/g);
      var filtered = (matches != null) ? matches.join('') : '';
      return (value == filtered);
    },
    isStatuteIdentifier: function(value) {
      return (value.match(/^[0-9]{1,4}[A-Za-z]{0,1}$/) != null);
    },
    isStatuteItem: function(value) {
      var matches = value.match(/(\/(osa|luku|pykala|momentti|kohta|alakohta|liite|voimaantulo|valiotsikko|johdanto|loppukappale|johtolause)\/*([0-9]+[a-z]{0,1})*)/g);
      var filtered = (matches != null) ? matches.join('') : '';
      return (value == filtered);
    },
    isStatuteVersion: function(value) {
      var matches = value.match(/(ajantasa|alkup)/g);
      var filtered = (matches != null) ? matches.join('') : '';
      return (value == filtered);
    }
  }
});
