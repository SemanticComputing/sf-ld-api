var self = {

  getStatuteItemId: function(uri) {
    console.log(uri)
    var _ = require('lodash');
    var matchesSDK = uri.match(/([0-9]{4})\/([0-9]+[A-Z]{0,1})/);
    var sdk = (matchesSDK.length > 2) ? "("+matchesSDK[2]+"/"+matchesSDK[1]+")" : ""
    var matchesITEM = uri.match(/(\/(osa|luku|pykala|momentti|kohta|alakohta|liite|voimaantulo|valiotsikko|johdanto|loppukappale|johtolause)\/*([0-9]+[a-z]{0,1})*)/g);
    var itemId = ''
    _.each(matchesITEM, function(item) {
      var tmp = item.replace(/\//g,' ').replace(/pykala/g,'§').trim()
      var tmp2 = tmp.match(/([^\s]+)\s([^\s]+)/)
      if (tmp2 != null && tmp2.length > 2)
        tmp=tmp2[2]+' '+tmp2[1]+' ';
      itemId += tmp
    })
    return sdk+' '+itemId;
  },

  getVersionDate: function(uri) {
    var matches = uri.match(/ajantasa\/([0-9]{8})/)
    if (matches !== null && matches[1])
      return matches[1];
    else
      return "alkuperäinen";
  },

  getWorkURI: function(uri) {
    return uri.match(/.*[0-9]{4}\/[0-9]{1,4}[A-Z]{0,1}/g).join("");
  }



};

module.exports = self;
