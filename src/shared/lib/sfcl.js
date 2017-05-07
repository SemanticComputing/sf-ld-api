class Sfcl {

  getPropertyByFormat(format) {
    switch(format) {
      case 'xml':
        return 'sfcl:xml';
      case 'html':
        return 'sfcl:html';
      case 'text':
      case 'txt':
      default: {
        return 'sfcl:text';
      }
    }
  }

}

const sfcl = new Sfcl()

export default sfcl
