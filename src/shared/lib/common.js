import prefix from './prefix'

class Common {

  getCourtByName(name) {
    switch (name) {
      case 'kko':
        return 'common:KKO';
        break;
      case 'kko':
        return 'common:KHO';
        break;
      default:
        return '';
        break;
    }
  }

  get2LetterLangCode(code) {
    switch (code) {
      case 'fi':
      case 'fin':
        return 'fi';
        break;
      case 'sv':
      case 'swe':
        return 'sv';
        break;
      default:
        return '';
        break;
    }
  }

}

const common = new Common()

export default common
