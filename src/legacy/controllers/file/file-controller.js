var self = {

    findZipFilesByDataset: function(req,res) {
      var moment = require('moment');
      var fs = require('fs');
      var _ = require('lodash');
      fs.readdir('dist/data/xml/'+req.param('dataset'), function(err, files) {
        if (files.length > 0) {
          var files_ = [];
          _.each(files, function(file) {
            var stats = fs.statSync('dist/data/xml/'+req.param('dataset')+'/'+file);
            if (stats) {
              files_.push({name: file, mtime: moment(stats.mtime).format("DD.MM.YYYY")});
            }
            else
              return res.render("Not found", 404);
          });
          res.render('file-list', {dataset: req.param('dataset'), title: self.getDatasetName(req.param('dataset'))+' (XML)', files: files_});
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
