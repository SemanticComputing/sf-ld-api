var express = require('express'),
    router = express.Router(),
    ldBrowserController = require('../controllers/ldb/ld-browser-controller'),
    rdfController = require('../controllers/rdf/rdf-controller');

function resolveContentType(acceptHeader) {
  if (acceptHeader.indexOf('html') > -1) return 'html';
  else return 'rdf';
}

// Special ajantasa/alkup handler
function findLegalResource(req,res) {
  function date2str(x, y) {
    var z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
    });

    return y.replace(/(y+)/g, function(v) {
        return x.getFullYear().toString().slice(-v.length)
    });
  }
  // uri terminated with ajantasa, or none -> get latest consolidated version
  switch (resolveContentType(req.get('Accept'))) {
    case 'html':
    req.originalUrl = req.originalUrl.substring(0,req.originalUrl.indexOf('.html')).replace('/ld-browser', '');
      ldBrowserController.findLegalResource(req,res);
      break;
    default:
      req.originalUrl = req.originalUrl.substring(0,req.originalUrl.indexOf('.html')).replace('/ld-browser', '');
      rdfController.findResource(req,res);
      break;
  }
}

function findResource(req,res) {
  switch (resolveContentType(req.get('Accept'))) {
    case 'html':
      req.originalUrl = req.originalUrl.substring(0,req.originalUrl.indexOf('.html')).replace('/ld-browser', '');
      ldBrowserController.findResource(req,res);
      break;
    default:
      rdfController.findResource(req,res);
  }
}

function findStatutes(req,res) {
  switch (resolveContentType(req.get('Accept'))) {
    case 'html':
      ldBrowserController.findStatutes(req,res);
      break;
    default:
      return rdfController.findStatutes(req,res);
  }
}

function findStatutesByYear(req,res) {
  req.query.year = req.originalUrl.match(/sd\/([0-9]{4})/)[1];
  switch (resolveContentType(req.get('Accept'))) {
    case 'html':
      return ldBrowserController.findStatutes(req,res);
      break;
    default:
      return rdfController.findStatutesByYear(req,res);
  }
}

//router.get(/.*\.html$/, ldBrowserController.findHtml);
//router.get(/.*\.rdf$/, rdfController.findResource);
//router.get(/.*\.txt$/, ldBrowserController.findText);
router.get(/.*\.xml$/, ldBrowserController.findXml);
router.get(/sd\/([0-9]{4})\/([0-9]+[A-Z]{0,1})(.*)\/(ajantasa)\/?([0-9]{8})\/(fin|swe)\/(txt|html|xml)\.html$/, findResource)
router.get(/sd\/([0-9]{4})\/([0-9]+[A-Z]{0,1})(.*)\/(ajantasa)\/?([0-9]{8})\/(fin|swe)\.html$/, findResource)
router.get(/sd\/([0-9]{4})\/([0-9]+[A-Z]{0,1})(.*)\/(ajantasa)\.html$/, findLegalResource)
router.get(/sd\/([0-9]{4})\/([0-9]+[A-Z]{0,1})(.*)\/(ajantasa)\/?([0-9]{8})\.html$/, findLegalResource)
router.get(/sd\/([0-9]{4})\/([0-9]+[A-Z]{0,1})(.*)\/(alkup)\/(fin|swe)\/(txt|html|xml)\.html$/, findResource)
router.get(/sd\/([0-9]{4})\/([0-9]+[A-Z]{0,1})(.*)\/(alkup)\/(fin|swe)\.html$/, findResource)
router.get(/sd\/([0-9]{4})\/([0-9]+[A-Z]{0,1})(.*)\/(alkup)\.html$/, findLegalResource)
router.get(/sd\/([0-9]{4})\/([0-9]+[A-Z]{0,1})(.*)\.html$/, findLegalResource)
router.get(/sd\/([0-9]{4})\/([0-9]+[A-Z]{0,1})\.html$/, findLegalResource)
router.get(/sd\/([0-9]{4})\.html$/, findStatutesByYear)
router.get(/sd\.html$/, findStatutes)

module.exports = router;
