import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import path from 'path';
import favicon from 'serve-favicon';
import redirect from './middleware/redirect';
import redirectLegacyEcli from './route/ecliLegacy';
import route from './route';
import Router from 'react-router';
import config from '../config.json';

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(favicon(path.join(__dirname, '../shared/images', 'favicon.ico')));
app.use(cors({exposedHeaders: config.corsHeaders}));
app.use(bodyParser.json({limit: config.bodyLimit}));
app.use(require('express-validator')({
  customValidators: {
    isContentType: function(value) {
       return (["txt", "xml", "html"].indexOf(value) > -1)
    },
    isECLI: function(value) {
       var matches = value.match(/ECLI:FI:(KKO|KHO):[0-9]{4}:(I|B|T){0,2}[0-9]{1,4}/g);
       var filtered = (matches != null) ? matches.join("") : "";
       return (value == filtered)
    },
    isFormat: function(value) {
      return (["json-ld", "n-triples", "rdf-json", "rdf-xml", "csv", "json", "xml"].indexOf(value) > -1)
    },
    isLanguage: function(value) {
      return (["fi", "sv"].indexOf(value) > -1)
    },
    isPointInTime: function(value) {
      var matches = value.match(/[0-9]{8}/g);
      var filtered = (matches != null) ? matches.join("") : "";
      return (value == filtered)
    },
    isStatuteIdentifier: function(value) {
      return (value.match(/^[0-9]{1,4}[A-Za-z]{0,1}$/) != null)
    },
    isStatuteItem: function(value) {
      var matches = value.match(/(\/(osa|luku|pykala|momentti|kohta|alakohta|liite|voimaantulo|valiotsikko|johdanto|loppukappale|johtolause)\/*([0-9]+[a-z]{0,1})*)/g);
      var filtered = (matches != null) ? matches.join("") : "";
      return (value == filtered)
    },
    isStatuteVersion: function(value) {
      var matches = value.match(/(ajantasa|alkup)/g);
      var filtered = (matches != null) ? matches.join("") : "";
      return (value == filtered)
    }
  }
}));

// legacy search
app.use('/api/v1', require('../legacy/routes/api'));

app.get('/', (req, res) => {return res.sendFile(path.resolve(__dirname+'/../../sf-docs/index.html'));});

// internal middleware
//app.use('/search', );
app.use('/oikeus', redirectLegacyEcli);
app.use('/', redirect);

// legacy routes, static files
app.use('/ld-browser', require('../legacy/routes/index'));
app.set('view engine', 'jade')
app.set('views', path.join(__dirname, '/../legacy/views'));
app.use('/legacy/images', express.static(path.join(__dirname, '../legacy/public/images')));
app.use('/legacy/bower_components', express.static(path.join(__dirname, '../legacy/public/bower_components')));
app.use('/legacy/stylesheets', express.static(path.join(__dirname, '../legacy/public/stylesheets')));
app.use('/legacy/scripts', express.static(path.join(__dirname, '../legacy/public/scripts')));
app.use('/legacy/json', express.static(path.join(__dirname, '../legacy/public/json')));

// static files
app.use('/images', express.static(path.join(__dirname, '../shared/images')));
app.use('/public', express.static(__dirname+'/../../dist/public'));
app.use('/sf-docs/partials', express.static(__dirname+'/../../sf-docs/partials'));
app.use('/sf-docs/images', express.static(__dirname+'/../../sf-docs/images'));
app.use('/sf-docs', express.static(__dirname+'/../../sf-docs/dist'));

// api router
app.use('/', route);

app.server.listen(process.env.PORT || config.port);

console.log(`Started on port ${app.server.address().port}`);

export default app;
