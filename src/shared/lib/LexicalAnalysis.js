import request from 'superagent';
import Promise from 'bluebird';
import config from '../../config.json';

export default class LexicalAnalysis {

  constructor(params = {}) {
    this.host = params.host || config.lasHost;
    this.headers = {}
  }

  // Lemmatize text into its base form
  getBaseForm(text) {
    return new Promise((resolve, reject) => {
      request.get(this.host+"/las/baseform")
        .query({text: text})
        .query({locale: "fi"})
        .set(this.headers)
        .end((err, res) => {
          if (err || !res.ok) return reject(err);
          return resolve(JSON.parse(res.text));
        });
    });
  }

  // Identify text language
  identifyLanguage(text) {
    return new Promise((resolve, reject) => {
      request.get(this.host+"/las/identify")
        .query({text: text})
        .set(this.headers)
        .end((err, res) => {
          if (err || !res.ok) return reject(err);
          return resolve(JSON.parse(res.text));
        });
    });
  }

}
