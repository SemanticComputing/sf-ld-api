import JsonLd from '../lib/JsonLd';
import Sparql from '../lib/Sparql';
import StatuteQuery from '../query/StatuteQuery';
import Promise from 'bluebird';

class StatuteCtrl {

  find(params) {
    return new Promise((resolve, reject) => {
      const query = (params.statuteId) ?
        new StatuteQuery(params).findOne() :
        new StatuteQuery(params).findMany();

      new Sparql()
        .select(query)
        .then((data) => {
          if (data.results.bindings.length==0)
            return reject();

          const jsonLd = new JsonLd(params);
          const dataFormatted = (params.statuteId) ?
            jsonLd.convertStatuteBindings(data) :
            jsonLd.convertStatuteListBindings(data);

          return resolve(dataFormatted)
        })
        .catch((err) => {
          return reject(err);
        })
    });
  }

}

const statuteCtrl = new StatuteCtrl()

export default statuteCtrl
