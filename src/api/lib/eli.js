class Eli {

  getLangResource(lang) {
    const ns = 'http://publications.europa.eu/resource/authority/language/'
    console.log(lang);
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

}

const eli = new Eli()

export default eli
