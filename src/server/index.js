import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import path from 'path';
import favicon from 'serve-favicon';
import redirect from './middleware/redirect';
import reqValidator from './middleware/reqValidator'
import redirectLegacyEcli from './route/ecliLegacy';
import route from './route';
import common from './route/common';
import schema from './route/schema';
import voidDesc from './route/void';
import Router from 'react-router';
import config from '../config.json';
import fileCtrl from './ctrl/fileCtrl'

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(favicon(path.join(__dirname, '../shared/images', 'favicon.ico')));
//app.use(cors({exposedHeaders: config.corsHeaders}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json({limit: config.bodyLimit}));
// Validate request
app.use(reqValidator);

// legacy search
app.use('/api/v1', require('../legacy/routes/api'));

// schemas, @TODO, replace with 303 and ldb
app.use('/schema', schema);
app.use('/common', common);
app.use('/void', voidDesc);

app.get('/data/xml/:dataset\.html', fileCtrl.findZipFilesByDataset);
app.get('/', (req, res) => {return res.sendFile(path.resolve(__dirname+'/../sf-docs/index.html'));});

// internal middleware
//app.use('/search', );
app.use('/oikeus', redirectLegacyEcli);
app.use('/', redirect);

// legacy routes, static files
//app.use('/', function(req,res,next) {console.log(req.originalUrl);next();}, require('../legacy/routes/index'));
app.set('view engine', 'jade')
app.set('views', path.join(__dirname, './views'));

// static files
app.use('/legacy/images', express.static(path.join(__dirname, '../legacy/public/images')));
app.use('/legacy/bower_components', express.static(path.join(__dirname, '../legacy/public/bower_components')));
app.use('/legacy/stylesheets', express.static(path.join(__dirname, '../legacy/public/stylesheets')));
app.use('/images', express.static(path.join(__dirname, '../shared/images')));
app.use('/public', express.static(__dirname+'/../../dist/public'));
app.use('/sf-docs/partials', express.static(__dirname+'/../sf-docs/partials'));
app.use('/sf-docs/images', express.static(__dirname+'/../sf-docs/images'));
app.use('/sf-docs', express.static(__dirname+'/../sf-docs/dist'));
app.use('/tagclouds', express.static(__dirname+'/../../tagclouds'));
app.use('/data/xml/asd', express.static(__dirname+'/../data/xml/asd'));
app.use('/data/xml/kko', express.static(__dirname+'/../data/xml/kko'));
app.use('/data/xml/kho', express.static(__dirname+'/../data/xml/kho'));

// api router
app.use('/', route);

app.server.listen(process.env.PORT || config.port);

console.log(`Started on port ${app.server.address().port}`);

export default app;
