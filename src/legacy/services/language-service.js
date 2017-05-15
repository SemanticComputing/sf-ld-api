var self = {

  getThreeLetterCodeByTwoLetterCode: function(code) {
    return {"fi": "fin", "sv": "swe"}[code];
  }

};

module.exports = self;
