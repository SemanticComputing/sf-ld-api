import Router from 'express'
import resource from './resource'
import toRes from '../middleware/toRes'

let router = Router()
  .use('/', resource, toRes)

export default router

