var express = require('express'),
    router = express.Router(),
    ldBrowserController = require('../controllers/ldb/ld-browser-controller'),
    rdfController = require('../controllers/rdf/rdf-controller'),
    fileController = require('../controllers/file/file-controller');

function findResource(req,res) {
  // Return HTML page
  if (req.get('Accept').indexOf('html') > -1) {
    req.originalUrl = req.originalUrl.substring(0,req.originalUrl.indexOf('.html')).replace('/ld-browser', '');
    ldBrowserController.findResource(req,res);
  // Return RDF data
} else {
    req.originalUrl = req.originalUrl.substring(0,req.originalUrl.indexOf('.html')).replace('/ld-browser', '');
    ldBrowserController.findRdf(req,res);
  }
}

router.get('/', findResource);
router.get('/voc*', findResource);
router.get('/common*', findResource);
router.get('/schema*', findResource);
router.get('/data/xml/:dataset\.html', fileController.findZipFilesByDataset);

module.exports = router;
