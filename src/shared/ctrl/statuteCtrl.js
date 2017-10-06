import LegislationJsonLd from '../lib/LegislationJsonLd';
import Sparql from '../lib/Sparql';
import statuteQuery from '../query/statuteQuery';
import Promise from 'bluebird';
import _ from 'lodash';

class StatuteCtrl {

  find(params) {
    return new Promise((resolve, reject) => {
      const query = (params.statuteId) ?
        statuteQuery.findOne(params) :
        statuteQuery.findMany(params);

      new Sparql()
        .select(query)
        .then((data) => {
          if (data.results.bindings.length === 0)
            return reject();

          const jsonLd = new LegislationJsonLd(params);
          const dataFormatted = (params.statuteId) ?
            jsonLd.convertStatuteBindings(data) :
            jsonLd.convertStatuteListBindings(data);

          return resolve(dataFormatted);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }


  findByQuery(params) {
    return new Promise((resolve, reject) => {
      const query = statuteQuery.findManyByQuery(params);

      new Sparql()
        .select(query)
        .then((data) => {
          if (data.results.bindings.length === 0)
            return resolve([]);

          // Select distinct by work URI
          const bindings = _.uniqBy(data.results.bindings, (item) => {
            return item.s.value;
          });
          return resolve(bindings);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

}

const statuteCtrl = new StatuteCtrl();

export default statuteCtrl;
