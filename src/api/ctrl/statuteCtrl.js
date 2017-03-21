import jsonLd from '../lib/jsonLd';
import Sparql from '../lib/Sparql';
import StatuteQuery from '../query/StatuteQuery';

class StatuteCtrl {

  find(req, res, next) {
    new Sparql()
      .select(new StatuteQuery(Object.assign(req.params, req.query)).findOne())
      .then((data) => {
         if (data.results.bindings.length==0)
          return next();
        res.locals.data = jsonLd.convertStatuteBindings(data);
        return next()
      })
      .catch((err) => {
        res.locals.err = err;
        return next();
      })
  }

}

const statuteCtrl = new StatuteCtrl()

export default statuteCtrl
