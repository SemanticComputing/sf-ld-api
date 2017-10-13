import Router from 'express';
import resource from './resource';
import toRes from '../middleware/toRes';

let router = Router()
  .use(['/search.html*', '/haku.html*'], (req,res,next) => {
    res.locals.data = {};
    return next();
  }, toRes)
  .use('/', resource, toRes);

export default router;
