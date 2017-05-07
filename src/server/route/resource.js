import Router from 'express'
import eli from './eli'
import ecli from './ecli'

let resource = Router()
  .use('*', (req, res, next) => {
    res.locals.urlComponents = {}
    return next();
  })
  .use('/eli', eli)
  .use('/ecli', ecli)

export default resource
