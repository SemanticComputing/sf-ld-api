import sfcl from '../lib/sfcl';
import common from '../lib/common';

const judgmentQuery = {

  findYears: (params) => {

  },

  findMany: (params) => {
    if (!(params.court || params.year || params.query)) {
      throw Error('At least one of court, year or query is required');
    }
    const lang = common.get2LetterLangCode(params.lang || 'fi');
    const limit = params.limit ? 'LIMIT ' + params.limit : (params.year) ? '' : 'LIMIT 100';
    const contentProperty = sfcl.getPropertyByFormat(params.format || 'text');
    const query = params.query ? getQueryQuery(params.query, sfcl.getPropertyByFormat('text')) : '';
    let judgment = '';
    if (params.court) {
      judgment += `?judgment dcterms:creator ${common.getCourtByName(params.court)} . `;
    }
    if (params.year) {
      judgment += `?judgment sfcl:year ?year . FILTER(YEAR(?year) = ${parseInt(params.year)})`;
    }

    return `SELECT DISTINCT * WHERE {
      ${query}
      ${judgment}
      ?judgment dcterms:isVersionOf ?ecli .
      ?judgment sfcl:isRealizedBy ?expression .
      ?expression dcterms:language "${lang}" .
      ?expression dcterms:title ?title .
      ?expression a ?expressionType .
      ?expression sfcl:isEmbodiedBy ?format .
      ?format a sfcl:Format .
      # Judgment might not have content
      OPTIONAL { ?format ${contentProperty} ?content . }
      ?judgment a ?judgmentType .
    } ${limit}`;
  },

  findOne: (params) => {
    const judgmentUri = `sfecli:${params.court}\\/${params.year}\\/${params.judgmentId}`;
    const lang = common.get2LetterLangCode(params.lang || 'fi');
    const contentProperty = sfcl.getPropertyByFormat(params.format || 'text');
    return `SELECT DISTINCT * WHERE {
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

function getQueryQuery(query, property) {
  return `
    {
      SELECT DISTINCT ?judgment {
        ?format text:query (${property} '${query}') .
        ?format a sfcl:Format .
        ?expression sfcl:isEmbodiedBy ?format .
        ?expression dcterms:language "fi" .
        ?expression dcterms:title ?title .
        ?expression a ?expressionType .
        ?judgment sfcl:isRealizedBy ?expression .
      }
    }
    FILTER(BOUND(?judgment))`;
}

export default judgmentQuery;
