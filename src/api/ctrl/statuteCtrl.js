import Sparql from '../lib/Sparql'
import StatuteQuery from '../query/StatuteQuery'

class StatuteCtrl {

  find(req, res, next) {
    new Sparql()
      .select(new StatuteQuery(Object.assign(req.params, req.query)).find())
      .then((data) => {
        res.locals.data = data
        return next()
      })
      .catch((err) => {
        res.locals.err = err
        return next()
      })
  }

}

const statuteCtrl = new StatuteCtrl()

export default statuteCtrl
