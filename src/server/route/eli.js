import Router from 'express'
import statuteCtrl from '../../shared/ctrl/statuteCtrl'

let find = (req, res, next, urlComponents = {}) => {
  const params = Object.assign(req.params, req.query, urlComponents);
  statuteCtrl.find(params)
    .then((data) => {
      res.locals.data = data;
      return next();
    })
    .catch((err) => {
      return next();
    });
};

let eli = Router()
  // .get(/.*(\/ajantasa|\/alkup)?(\/[0-9]{8})?(\/fin|\/swe|\/fi|\/sv)?.*/, (req, res, next) => {
  //   console.log(req.params);
  //   res.locals.urlComponents = {
  //     version: req.params[0] ? req.params[0].substring(1) : '',
  //   };
  //   next();
  // })
  .get(/sd(\/[0-9]{4})?(\/[0-9]{1,4}[A-Za-z]{0,1})?(.*)?\.([^.]+)/, (req, res, next) => {
    return find(req, res, next, Object.assign(res.locals.urlComponents, {
      year: req.params[0] ? req.params[0].substring(1) : '',
      statuteId: req.params[1] ? req.params[1].substring(1) : '',
      sectionOfALaw: req.params[2] ? req.params[2].match(/(\/(osa|luku|pykala|momentti|kohta|alakohta|liite|voimaantulo|valiotsikko|johdanto|loppukappale|johtolause)\/*([0-9]+[a-z]{0,1})*)/g).join('') : ''
    });
  })
/*  .get(/sd\/([0-9]{4})\/([0-9]{1,4}[A-Za-z]{0,1})\.([^.]+)/, (req, res, next) => {
    console.log('no section of a law')
    return find(req, res, next, {
      year: req.params[0],
      statuteId: req.params[1]
    });
  })
  .get(/sd\/([0-9]{4})\.([^.]+)/, (req, res, next) => {
    return find(req, res, next, {
      year: req.params[0],
    });
  })*/
  //.get(/sd\.([^.]+)/, find);

export default eli
