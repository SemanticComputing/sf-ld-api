import Router from 'express'
import eli from './eli'

let resource = Router()
  .use('/eli', eli)

export default resource
