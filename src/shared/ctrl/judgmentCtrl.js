import CaseLawJsonLd from '../lib/CaseLawJsonLd';
import Sparql from '../lib/Sparql';
import JudgmentQuery from '../query/JudgmentQuery';
import Promise from 'bluebird';

class JudgmentCtrl {

  find(params) {
    return new Promise((resolve, reject) => {
      const query = (params.judgmentId) ?
        new JudgmentQuery(params).findOne() :
        new JudgmentQuery(params).findMany();

      new Sparql()
        .select(query)
        .then((data) => {
          if (data.results.bindings.length==0)
            return reject();

          const jsonLd = new CaseLawJsonLd(params);
          const dataFormatted = (params.judgmentId) ?
            jsonLd.convertJudgmentBindings(data) :
            jsonLd.convertJudgmentListBindings(data);

          return resolve(dataFormatted)
        })
        .catch((err) => {
          return reject(err);
        })
    });
  }

}

const judgmentCtrl = new JudgmentCtrl()

export default judgmentCtrl
