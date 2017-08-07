var self = {

    findZipFilesByDataset: function(req,res) {
      var moment = require('moment');
      var fs = require('fs');
      fs.readdir('dist/data/xml/'+req.param('dataset'), function(err, files) {
        if (files.length > 0) {
          fs.stat('dist/data/xml/'+req.param('dataset')+'/'+files[0], function(err, stats) {
            if (stats) {
              files = [{name: files[0], mtime: moment(stats.mtime).format("DD.MM.YYYY")}];
              res.render('file-list', {dataset: req.param('dataset'), title: self.getDatasetName(req.param('dataset'))+' (XML)', files: files});
            }
            else
              return res.render("Not found", 404);
          });
        } else {
          return res.render("Not found", 404);
        }
      });
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
