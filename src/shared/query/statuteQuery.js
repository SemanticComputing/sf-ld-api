import moment from 'moment';
import eli from '../lib/eli';
import sfl from '../lib/sfl';

const FREE_GRAPH = '<http://data.finlex.fi/eli/sd/alkup>';
const DEFAULT_LIMIT = 10;

const statuteQuery = {

  findOne: (params) => {
    const sectionOfALaw = params.sectionOfALaw ? params.sectionOfALaw.replace(/\//gi, '\\/') : '';
    const statuteUri = `sfsd:${params.year}\\/${params.statuteId}${sectionOfALaw}`;
    const fromGraph = params.free ? `FROM ${FREE_GRAPH}` : '';
    const versionDateFilter = params.pointInTime ?
      `FILTER ("${moment(params.pointInTime, 'YYYYMMDD').format('YYYY-MM-DD')}"^^xsd:date >= ?vd)` : '';
    const lang = eli.getLangResource(params.lang || 'fi');
    const format = eli.getFormatResource(params.format || 'text');
    const limit = params.year ? '' : `LIMIT ${params.limit || 10}`;
    const offset = params.offset ? `OFFSET ${params.offset}` : '';
    const tree = params.hasOwnProperty('tree') ? '?statuteVersion eli:has_part* ?s .' : 'BIND(?statuteVersion AS ?s)';
    const treeFilter = params.hasOwnProperty('tree') ? 'FILTER NOT EXISTS { ?s eli:has_part _:b . }' : '';
    const contentProperty = sfl.getPropertyByFormat(params.format || 'text');

    return `SELECT DISTINCT * ${fromGraph} WHERE {
      {
        {
          SELECT DISTINCT ?statute (MAX(COALESCE(?vd, "")) AS ?versionDate) WHERE {
            VALUES ?statute { ${statuteUri} }
            ?statute eli:has_member ?statuteVersion .
            OPTIONAL {
              ?statuteVersion eli:version_date ?vd .
              ${versionDateFilter}
            }
          } GROUP BY ?statute ${limit} ${offset}
        }
        FILTER(BOUND(?statute))
        # Matching consolidated version
        OPTIONAL {
          ?statute eli:has_member ?statuteVersion .
          ?statuteVersion eli:version_date ?versionDate .
        }
        # No matching consolidated version, find original
        OPTIONAL {
          ?statute eli:has_member ?statuteVersion .
          ?statuteVersion eli:version sfl:Original .
        }
        FILTER(BOUND(?statuteVersion))
        ${tree}
        ?s eli:is_realized_by ?expression .
        ?expression eli:language ${lang} .
        OPTIONAL {
          ?s ?p ?o .
          FILTER (?p!=eli:is_part_of)
          FILTER (?p!=eli:is_realized_by)
        }
        OPTIONAL {
          ?expression eli:title ?title .
        }
        OPTIONAL {
          ${treeFilter}
          ?expression eli:is_embodied_by ?format .
          ?format eli:format ${format} .
          ?format ${contentProperty} ?content .
        }
      } UNION {
        BIND(${statuteUri} AS ?s)
        ?s ?p ?o.
      }
    }`;
  },

  findMany: (params) => {
    const fromGraph = params.free ? `FROM ${FREE_GRAPH}` : '';
    const yearFilter = params.year ? `FILTER STRENDS(?idLocal, "${params.year}")` : '';
    const original = params.version === 'alkup' ? '?statuteVersion eli:version sfl:Original .' : '';
    const lang = eli.getLangResource(params.lang || 'fi');

    const limit = params.year ? '' : `LIMIT ${params.limit || DEFAULT_LIMIT}`;
    const offset = params.offset ? `OFFSET ${params.offset}` : '';

    const refinedParams = {
      query: params.query,
      queryBaseForm: params.queryBaseForm,
      fromGraph: fromGraph,
      yearFilter: yearFilter,
      lang: lang,
      original: original
    };

    const resultset = params.query ? getFindManyByQueryResultset(refinedParams) : getFindManyResultset(refinedParams);

    return `SELECT DISTINCT * ${fromGraph} WHERE {
      {
        SELECT DISTINCT ?statute ?score {
          ${resultset}
          BIND(xsd:integer(REPLACE(?idLocal, ".*/([0-9]+).?$", "$1")) AS ?year)
          BIND(xsd:integer(REPLACE(?idLocal, "[^0-9]+[0-9]+", "")) AS ?number)
          BIND(REPLACE(?idLocal, "[^A-Z]", "") AS ?letter)
        } ORDER BY DESC(?score) ?year ?number ?letter ${limit} ${offset}
      }
      FILTER(BOUND(?statute))
      ?statute eli:id_local ?idLocal .
      ?statute sfl:statuteType ?statuteType .
      ?statute eli:has_member ?statuteVersion .
      ?statuteVersion eli:is_realized_by ?expression .
      ?statuteVersion a ?statuteVersionType .
      ?expression eli:language ${lang} .
      ?expression eli:title ?title .
      ?expression a ?expressionType .
    }`;
  }
};

function getFindManyResultset(params) {
  return `
    ${params.original}
    ?statute eli:id_local ?idLocal .
    ${params.yearFilter}
    ?statute a sfl:Statute .
    ?statute eli:has_member ?statuteVersion .
    ?statuteVersion eli:is_realized_by ?expression .
    ?expression eli:language ${params.lang} .
    ?expression eli:title ?title .
  `;
}

function getFindManyByQueryResultset(params) {
  const sanitize = (qry) => qry.replace(/[^a-zA-ZäöåÄÖÅ0-9*"\s]/gi, '').toLowerCase();
  let query = sanitize(params.query);
  if (params.queryBaseForm) {
    query += ' ' + sanitize(params.queryBaseForm);
  }

  return `
    (?format ?score) text:query (sfl:text '${query}') .
    ?expression eli:is_embodied_by ?format .
    ?expression eli:language ${params.lang} .
    ?expression eli:title ?title .
    ?statuteVersion eli:is_realized_by ?expression .
    ${params.original}
    ?statute eli:has_member ?statuteVersion .
    ?statute a sfl:Statute .
    ?statute eli:id_local ?idLocal .
    ${params.yearFilter}
    ?expression eli:language ${params.lang} .`;
}

export default statuteQuery;
