var express = require('express'),
    router = express.Router(),
    ldBrowserController = require('../controllers/ldb/ld-browser-controller'),
    rdfController = require('../controllers/rdf/rdf-controller');

function resolveContentType(acceptHeader) {
  if (acceptHeader.indexOf('html') > -1) return 'html';
  else return 'rdf';
}

function findResource(req,res) {
  // Return HTML page
  if (req.get('Accept').indexOf('html') > -1)
    ldBrowserController.findResource(req,res);
  // Return RDF data
  else
    ldBrowserController.findRdf(req,res);
}

function findJudgments(req,res) {
  switch (resolveContentType(req.get('Accept'))) {
    case 'html':
      return ldBrowserController.findJudgments(req,res);
      break;
    default:
      return rdfController.findJudgments(req,res);
  }
}

function findJudgment(req,res) {
  switch (resolveContentType(req.get('Accept'))) {
    case 'html':
      return ldBrowserController.findJudgment(req,res);
      break;
    default:
      return rdfController.findResource(req,res);
  }
}


//router.get(/.*\.html$/, ldBrowserController.findHtml);
//router.get(/.*\.rdf$/, rdfController.findResource);
//router.get(/.*\.txt$/, ldBrowserController.findText);
//router.get(/.*\.xml$/, ldBrowserController.findXml);//router.get(/eli\/sd\/([0-9]{4})$/, findStatutes)
router.get('/ECLI:FI:(KKO|KHO):([0-9]{4}):(I|B|T){0,2}[0-9]{1,4}', findJudgment);
router.get('/ECLI*', findResource);
router.get('', findJudgments);
//router.get(/ecli\/(kko|kho)\/([0-9]{4})$/, findJudgmentsByYear)
//router.get(/ecli\/(kko|kho)$/, findJudgmentsByCourt)

module.exports = router;
