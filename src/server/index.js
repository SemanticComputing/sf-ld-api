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


app.get('/', (req, res) => {return res.sendFile(path.resolve(__dirname+'/../../sf-docs/index.html'));});

// internal middleware
//app.use('/search', );
app.use('/oikeus', redirectLegacyEcli);
app.use('/', redirect);

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
