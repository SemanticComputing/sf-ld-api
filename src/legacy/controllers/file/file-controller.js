var self = {

    findZipFilesByDataset: function(req,res) {
      var fs = require('fs');
      var files = fs.readdirSync('./public/data/'+req.param('dataset'));
      res.render('file-list', {dataset: req.param('dataset'), title: self.getDatasetName(req.param('dataset'))+' (XML)', files: files});
    },

    getDatasetName: function(code) {
      switch (code) {
        case 'asd': return 'Alkuperäiset säädökset'; break;
        case 'kko': return 'KKO:n ratkaisut'; break;
        case 'kho': return 'KHO:n ratkaisut'; break;
        default: break;
      }
    }

}
module.exports = self;
