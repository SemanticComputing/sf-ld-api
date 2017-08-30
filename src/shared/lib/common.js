class Common {

  getCourtByName(name) {
    switch (name) {
      case 'kko':
        return 'common:KKO';
      default:
        return '';
    }
  }

  get2LetterLangCode(code) {
    switch (code) {
      case 'fi':
      case 'fin':
        return 'fi';
      case 'sv':
      case 'swe':
        return 'sv';
      default:
        return '';
    }
  }

}

const common = new Common();

export default common;
