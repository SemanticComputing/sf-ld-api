import ConceptJsonLd from '../lib/ConceptJsonLd';
import Sparql from '../lib/Sparql';
import ConceptQuery from '../query/ConceptQuery';
import Promise from 'bluebird';
import _ from 'lodash';

class ConceptCtrl {

  find(params) {
    return new Promise((resolve, reject) => {
      const query = (params.statuteId) ?
        new ConceptQuery(params).findOne() :
        new ConceptQuery(params).findMany();

      console.log(query)

      new Sparql({endpoint: 'http://ldf.fi/onki-light/sparql'})
        .select(query)
        .then((data) => {
          if (data.results.bindings.length==0)
            return reject();

          const bindings = _.map(data.results.bindings, (val, key) => {
            return Object.assign(val, {id: key});
          });
          console.log(bindings);
          return resolve(bindings)
        })
        .catch((err) => {
          return reject(err);
        })
    });
  }

}

const conceptCtrl = new ConceptCtrl()

export default conceptCtrl
