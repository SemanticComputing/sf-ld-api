import LegislationJsonLd from '../lib/LegislationJsonLd';
import Sparql from '../lib/Sparql';
import StatuteQuery from '../query/StatuteQuery';
import Promise from 'bluebird';
import _ from 'lodash';

class StatuteCtrl {

  find(params) {
    return new Promise((resolve, reject) => {
      const query = (params.statuteId) ?
        new StatuteQuery(params).findOne() :
        new StatuteQuery(params).findMany();

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
      const query = new StatuteQuery(params).findManyByQuery();

      new Sparql()
        .select(query)
        .then((data) => {
          if (data.results.bindings.length==0)
            return resolve([]);

          // Select distinct by work URI
          const bindings = _.uniqBy(data.results.bindings, (item) => {
            console.log(item.s.value);
            return item.s.value;
          });
          console.log(bindings);

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
