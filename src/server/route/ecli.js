import Router from 'express'
import judgmentCtrl from '../../shared/ctrl/judgmentCtrl'

let findData = (req, res, next, urlComponents = {}) => {
  const params = Object.assign(req.params, req.query, urlComponents);
  // Force HTML format in browser requests
  if (req.originalUrl.match(/(.html((\?){1}|$))/)) {
    params.format = 'html';
  }
  judgmentCtrl.find(params)
    .then((data) => {
      res.locals.data = data;
      return next();
    })
    .catch((err) => {
      console.error(err);
      return next();
    });
};

let ecli = Router()
  .get(/.*(\/xml|\/html|\/txt|\/text).*/, (req, res, next) => {
    res.locals.urlComponents = Object.assign(res.locals.urlComponents, {
      format: req.params[0].substring(1)
    });
    return next();
  })
  .get(/.*(\/fin|\/swe|\/fi|\/sv).*/, (req, res, next) => {
    res.locals.urlComponents = Object.assign(res.locals.urlComponents, {
      lang: req.params[0].substring(1)
    });
    return next();
  })
  .get(/(\/kko|\/kho)?(\/[0-9]{4})?(\/[0-9]{1,4}[A-Za-z]{0,1})?(.*)?\.([^.]+)/, (req, res, next) => {
    const params = {};
    if (req.params[0]) params.court = req.params[0].substring(1);
    if (req.params[1]) params.year = req.params[1].substring(1);
    if (req.params[2]) params.judgmentId = req.params[2].substring(1);
    return findData(req, res, next, Object.assign(res.locals.urlComponents, params));
  });

export default ecli
