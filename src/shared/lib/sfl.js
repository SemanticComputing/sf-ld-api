class Sfl {

  getPropertyByFormat(format) {
    switch(format) {
      case 'xml':
        return 'sfl:xml';
      case 'html':
        return 'sfl:html';
      case 'text':
      case 'txt':
      default: { 
        return 'sfl:text';
      }
    }
  }

}

const sfl = new Sfl();

export default sfl;
