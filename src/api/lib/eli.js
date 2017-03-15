class Eli {

  getLangResource(lang) {
    const ns = 'http://publications.europa.eu/resource/authority/language/'
    switch(lang) {
      case 'fi'|'fin': {
        return '<'+ns+'FIN>'
      }
      case 'sv'|'swe': {
        return '<'+ns+'SWE>'
      }
    }

  }

}

const eli = new Eli()

export default eli
