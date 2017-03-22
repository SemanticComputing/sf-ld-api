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

}

const eli = new Eli()

export default eli
