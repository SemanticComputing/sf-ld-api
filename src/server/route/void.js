import Router from 'express';
import path from 'path';

let voidDesc = Router()
  .get('/', (req, res, next) => {
    res.status(200);
    res.set('Content-Type', 'text/turtle');
    res.sendFile(path.resolve(__dirname+'/../../shared/data/sf-void.ttl'));
  });


export default voidDesc;
