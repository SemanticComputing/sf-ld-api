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

}

const common = new Common()

export default common
