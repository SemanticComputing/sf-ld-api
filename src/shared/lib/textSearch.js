import Promise from 'bluebird';
import statuteCtrl from '../ctrl/statuteCtrl'
import LexicalAnalysis from './LexicalAnalysis'

const textSearch = {

  getQueryHandler: (docCategory = 'sd') => {
    const handlers = {
      'sd': statuteCtrl.findByQuery,
      'oikeus': 'oikeusHandler'
    };
    return handlers['sd'];
  },

  search: (docCategory, query) => {
    return new Promise((resolve, reject) => {
      new LexicalAnalysis().identifyLanguage(query)
        .then((data) => {
          console.log(data.locale);
          if (data.locale == "fi") return new LexicalAnalysis().getBaseForm(query)
          return ""
        })
        .then((baseForm) => {
          console.log(baseForm);
          const queryParam = {query: query};
          const params = (baseForm) ? Object.assign(queryParam, {queryBaseForm: baseForm}) : queryParam;
          return textSearch.getQueryHandler()(params);
        })
        .then((results) => {
          return resolve(results);
        })
        .catch((err) => {
          return reject(err)
        });
      });
    }
}

export default textSearch;
