import Sparql from '../lib/Sparql';
import ConceptQuery from '../query/ConceptQuery';
import Promise from 'bluebird';
import _ from 'lodash';
import config from '../../config.json';

class ConceptCtrl {

  constructor(params = {}) {
    this.endpoint = params.endpoint || config.conceptEndpoint;
  }

  find(params) {
    return new Promise((resolve, reject) => {
      const query = (params.statuteId) ?
        new ConceptQuery(params).findOne() :
        new ConceptQuery(params).findMany();

      new Sparql({endpoint: this.endpoint})
        .select(query)
        .then((data) => {
          if (data.results.bindings.length === 0)
            return resolve([]);

          const bindings = _.map(data.results.bindings, (val, key) => {
            return Object.assign(val, {id: key});
          });

          return resolve(bindings);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

}

const conceptCtrl = new ConceptCtrl();

export default conceptCtrl;
