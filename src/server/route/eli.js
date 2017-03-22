import Router from 'express'
import statuteCtrl from '../../shared/ctrl/statuteCtrl'

let eli = Router()
  .get(/sd\.([^.]+)/, statuteCtrl.find) 

export default eli
