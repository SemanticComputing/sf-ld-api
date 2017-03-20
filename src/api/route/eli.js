import Router from 'express'
import statuteCtrl from '../ctrl/statuteCtrl'

let eli = Router()
  .get(/sd\.([^.]+)/, statuteCtrl.find) 

export default eli
