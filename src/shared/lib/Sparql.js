import request from 'superagent';
import Promise from 'bluebird';
import config from '../../config.json';
import prefix from './prefix';

export default class {

  constructor(params = {}) {
    this.endpoint = params.endpoint || config.finlexEndpoint;
    this.headers = params.headers || {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json'
    };
  }

  // make sparql select query
  select(query) {
    console.log(query);
    return new Promise((resolve, reject) => {
      request.post(this.endpoint)
        .send({query: prefix.prefixesSparql+query})
        // default headers
        .set(this.headers)
        .end((err, res) => {
          if (err || !res.ok) return reject(err);
          // results as json
          return resolve(JSON.parse(res.text));
        });
    });
  }

}
