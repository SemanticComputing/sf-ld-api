import _        from 'lodash';

class Eli {

  getLangCodeByLang(lang) {
    switch(lang) {
      case 'sv':
      case 'se':
      case 'swe': {
        return 'swe';
      }
      case 'fi':
      case 'fin':
      default: {
        return 'fin';
      }
    }
  }

  getFormatCodeByFormat(format) {
    switch(format) {
      case 'xml': {
        return 'xml';
      }
      case 'html': {
        return 'html';
      }
      case 'text':
      case 'txt':
      case 'default': {
        return 'txt';
      }
    }
  }

  getLangResource(lang) {
    const ns = 'http://publications.europa.eu/resource/authority/language/'
    switch(lang) {
      case 'sv':
      case 'swe': {
        return '<'+ns+'SWE>'
      }
      case 'fi':
      case 'fin':
      default: {
        return '<'+ns+'FIN>'
      }
    }
  }

  getFormatResource(format) {
    switch(format) {
      case 'xml': {
        return '<	http://www.iana.org/assignments/media-types/application/xml>';
      }
      case 'html': {
        return '<http://www.iana.org/assignments/media-types/text/html>';
      }
      case 'text':
      case 'txt':
      default: {
        return '<http://tools.ietf.org/html/rfc5147>';
      }
    }
  }

  getSectionOfALawLocalId(uri) {
    var matchesItem = uri.match(/(\/(osa|luku|pykala|momentti|kohta|alakohta|liite|voimaantulo|valiotsikko|johdanto|loppukappale|johtolause)\/*([0-9]+[a-z]{0,1})*)/g);
    var itemId = ''
    _.each(matchesItem, function(item) {
      var tmp = item.replace(/\//g,' ').replace(/pykala/g,'§').trim()
      var tmp2 = tmp.match(/([^\s]+)\s([^\s]+)/)
      if (tmp2 != null && tmp2.length > 2)
        tmp=tmp2[2]+' '+tmp2[1]+' ';
      itemId += tmp
    })
    return itemId;
  }

  getStatuteLocalId(uri) {
    var matchesSdk = uri.match(/([0-9]{4})\/([0-9]+[A-Z]{0,1})/);
    return (matchesSdk.length > 2) ? matchesSdk[2]+"/"+matchesSdk[1] : ""
  }


}

const eli = new Eli()

export default eli
