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
  if (req.get('Accept').indexOf('html') > -1) {
    req.originalUrl = req.originalUrl.substring(0,req.originalUrl.indexOf('.html')).replace('/ld-browser', '');
    ldBrowserController.findResource(req,res);
  // Return RDF data
}
  else
    ldBrowserController.findRdf(req,res);
}

function findJudgments(req,res) {
  switch (resolveContentType(req.get('Accept'))) {
    case 'html':
      req.originalUrl = req.originalUrl.substring(0,req.originalUrl.indexOf('.html')).replace('/ld-browser', '');
      return ldBrowserController.findJudgments(req,res);
      break;
    default:
      return rdfController.findJudgments(req,res);
  }
}

function findJudgment(req,res) {
  switch (resolveContentType(req.get('Accept'))) {
    case 'html':
      req.originalUrl = req.originalUrl.substring(0,req.originalUrl.indexOf('.html')).replace('/ld-browser', '');
      return ldBrowserController.findJudgment(req,res);
      break;
    default:
      return rdfController.findResource(req,res);
  }
}

router.get(/.*\.xml$/, ldBrowserController.findXml);
router.get(/\/(kko|kho)\/([0-9]{4})\/(I|B|T){0,2}[0-9]{1,4}\/(fin|swe)\/(html|txt|text|xml)\.html/, findResource);
router.get(/\/(kko|kho)\/([0-9]{4})\/(I|B|T){0,2}[0-9]{1,4}\/(fin|swe)\.html/, findResource);
router.get(/\/(kko|kho)\/([0-9]{4})\/(I|B|T){0,2}[0-9]{1,4}\.html/, findJudgment);
router.get(/\/(kko|kho)\/([0-9]{4})\.html/, findJudgments);
router.get(/\/(kko|kho)\.html/, findJudgments);
router.get(/\.html/, findJudgments);

module.exports = router;
