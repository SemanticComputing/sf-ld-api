import sfcl from '../lib/sfcl';
import common from '../lib/common';

const judgmentQuery = {

  findMany: (params) => {
    if (!(params.court || params.year)) {
      throw Error('Either court or year is required');
    }
    const lang = common.get2LetterLangCode(params.lang || 'fi');
    const limit = params.limit ? 'LIMIT ' + params.limit : (params.year) ? '' : 'LIMIT 10';
    let judgment = '';
    if (params.court) {
      judgment += `?judgment dcterms:creator ${common.getCourtByName(params.court)} . `;
    }
    if (params.year) {
      judgment += `?judgment dcterms:date ?date . FILTER(YEAR(?date) = ${parseInt(params.year)})`;
    }

    return `SELECT * WHERE {
      ${judgment}
      ?judgment dcterms:isVersionOf ?ecli .
      ?judgment sfcl:isRealizedBy ?expression .
      ?expression dcterms:language "${lang}" .
      ?expression dcterms:title ?title .
      ?expression a ?expressionType .
      ?judgment a ?judgmentType .
    } ${limit}`;
  },

  findOne: (params) => {
    const judgmentUri = `sfecli:${params.court}\\/${params.year}\\/${params.judgmentId}`;
    const lang = common.get2LetterLangCode(params.lang || 'fi');
    const contentProperty = sfcl.getPropertyByFormat(params.format || 'text');
    return `SELECT * WHERE {
      {
        VALUES ?judgment { ${judgmentUri} }
        ?judgment dcterms:isVersionOf ?ecli .
        ?judgment sfcl:isRealizedBy ?expression .
        ?expression dcterms:language "${lang}" .
        ?expression dcterms:title ?title .
        ?expression a ?expressionType .
        ?expression sfcl:isEmbodiedBy ?format .
        ?format a sfcl:Format .
        ?format ${contentProperty} ?content .
      }
      UNION {
       BIND(${judgmentUri} AS ?judgment)
       ?judgment ?p ?o.
       FILTER (?p != sfcl:isRealizedBy)
      }
    }`;
  }
};

export default judgmentQuery;
