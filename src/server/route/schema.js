import Router from 'express';
import path from 'path';

let schema = Router()
  .get('/sfl', (req, res, next) => {
    res.status(200);
    res.set('Content-Type', 'text/turtle');
    res.sendFile(path.resolve(__dirname+'/../../shared/data/sfl.ttl'));
  })
  .get('/sfcl', (req, res, next) => {
    res.status(200);
    res.set('Content-Type', 'text/turtle');
    res.sendFile(path.resolve(__dirname+'/../../shared/data/sfcl.ttl'));
  })


export default schema
