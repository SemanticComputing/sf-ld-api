import Router from 'express'
import eli from './eli'

let resource = Router()
  .use('*', (req, res, next) => {
    res.locals.urlComponents = {}
    return next();
  })
  .use('/eli', eli)

export default resource
