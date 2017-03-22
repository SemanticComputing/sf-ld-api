import JsonLd from '../lib/JsonLd';
import Sparql from '../lib/Sparql';
import StatuteQuery from '../query/StatuteQuery';

class StatuteCtrl {

  find(req, res, next) {

    const params = Object.assign(req.params, req.query);
    const query = (params.statuteId) ?
      new StatuteQuery(params).findOne() :
      new StatuteQuery(params).findMany();

    new Sparql()
      .select(query)
      .then((data) => {
        if (data.results.bindings.length==0)
          return next();

        const jsonLd = new JsonLd(params);
        res.locals.data = (params.statuteId) ?
          jsonLd.convertStatuteBindings(data) :
          jsonLd.convertStatuteListBindings(data);

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
