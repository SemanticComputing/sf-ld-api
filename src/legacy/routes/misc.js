var express = require('express'),
    router = express.Router(),
    ldBrowserController = require('../controllers/ldb/ld-browser-controller'),
    rdfController = require('../controllers/rdf/rdf-controller'),
    fileController = require('../controllers/file/file-controller');

function findResource(req,res) {
  // Return HTML page
  if (req.get('Accept').indexOf('html') > -1)
    ldBrowserController.findResource(req,res);
  // Return RDF data
  else
    ldBrowserController.findRdf(req,res);
}

//router.get(/.*\.html$/, ldBrowserController.findHtml);
//router.get(/.*\.rdf$/, rdfController.findResource);
//router.get(/.*\.txt$/, ldBrowserController.findText);
//router.get(/.*\.xml$/, ldBrowserController.findXml);
router.get('/', findResource);
router.get('/voc*', findResource);
router.get('/common*', findResource);
router.get('/schema*', findResource);
router.get('/data/:dataset', fileController.findZipFilesByDataset);

module.exports = router;
