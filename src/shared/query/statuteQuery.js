import moment from 'moment';
import eli from '../lib/eli';
import sfl from '../lib/sfl';

const FREE_GRAPH = '<http://data.finlex.fi/eli/sd/alkup>';

const statuteQuery = {

  findMany: (params) => {
    const fromGraph = params.free ? `FROM ${FREE_GRAPH}` : '';
    const yearFilter = params.year ? `FILTER STRENDS(?idLocal, "${params.year}")` : '';
    const limit = params.year ? '' : `LIMIT ${params.limit || 10}`;
    const offset = params.offset ? `OFFSET ${params.offset}` : '';
    const lang = eli.getLangResource(params.lang || 'fi');
    const original = params.version === 'alkup' ? '?statuteVersion eli:version sfl:Original .' : '';

    return `SELECT * ${fromGraph} WHERE {
      {
        SELECT DISTINCT ?statute ?year ?number ?letter {
          ${original}
          ?statute a sfl:Statute .
          ?statute eli:id_local ?idLocal .
          ${yearFilter}
          BIND(xsd:integer(REPLACE(?idLocal, "[^0-9]+[0-9]+", "")) AS ?number)
          BIND(REPLACE(?idLocal, "[^A-Z]", "") AS ?letter)
        } ORDER BY ?year ?number ?letter ${limit} ${offset}
      }
      FILTER(BOUND(?statute))
      ?statute eli:has_member ?statuteVersion .
      ?statute eli:id_local ?idLocal .
      ?statute sfl:statuteType ?statuteType .
      ?statuteVersion eli:is_realized_by ?expression .
      ?statuteVersion a ?statuteVersionType .
      ?expression eli:language ${lang} .
      ?expression eli:title ?title .
      ?expression a ?expressionType .
    }`;
  },

  findManyByQuery: (params) => {
    const query = (params.query) ? params.query.replace(/[^a-zA-ZäöåÄÖÅ0-9*"\s]/gi,'').toLowerCase() : '';
    const queryBaseForm = (params.queryBaseForm) ? params.queryBaseForm : '';
    return `
      SELECT DISTINCT ?c ?l ?v ?s ?st ?stt ?t ?title ?txt ?score ?matchType WHERE {
       {
          ?e text:query (eli:title '${query}' 20) .
          ?s eli:has_member ?v.
          ?v eli:is_realized_by ?e .
          ?e eli:is_embodied_by ?f .
          ?e eli:title ?title .
          ?e eli:is_embodied_by ?f2 .
          ?f2 sfl:html ?txt .
          FILTER NOT EXISTS {
            ?s eli:in_force eli:InForce-notInForce .
          }
          OPTIONAL {
            ?v eli:is_part_of+ ?st .
            ?st eli:is_member_of ?stw .
            ?stw a sfl:Statute .
            FILTER NOT EXISTS {
              ?stw eli:in_force eli:InForce-notInForce .
            }
            ?st eli:is_realized_by ?ste .
            ?ste eli:title ?stt .
            FILTER (LANG(?stt) = 'fi')
          }
          VALUES ?score {20}
          VALUES ?matchType {'title'}
          ?s a ?t .
        } UNION {
          (?f ?score) text:query (sfl:textLemmatized '${queryBaseForm}' 20) .
          ?s eli:has_member ?v.
          ?v eli:is_realized_by ?e .
          ?e eli:is_embodied_by ?f .
          ?e eli:is_embodied_by ?f2 .
          ?f2 sfl:html ?txt .
          VALUES ?matchType {'content'}
          ?s a ?t .
          FILTER (?t IN ( sfl:Subsection, sfl:Section ) )
          OPTIONAL { ?e eli:title ?title } .
          ?v eli:is_part_of+ ?st .
          ?st eli:is_member_of ?stw .
          ?stw a sfl:Statute .
          FILTER NOT EXISTS {
            ?stw eli:in_force eli:InForce-notInForce .
          }
          ?st eli:is_realized_by ?ste .
          ?ste eli:title ?stt .
          FILTER (LANG(?stt) = 'fi')
        } UNION {
          (?f ?score) text:query (sfl:text '${query}' 20) .
          ?s eli:has_member ?v.
          ?v eli:is_realized_by ?e .
          ?e eli:is_embodied_by ?f .
          ?e eli:is_embodied_by ?f2 .
          ?f2 sfl:html ?txt .
          VALUES ?matchType {'content'}
          ?s a ?t .
          FILTER (?t IN ( sfl:Subsection, sfl:Section ) )
          OPTIONAL { ?e eli:title ?title } .
          ?v eli:is_part_of+ ?st .
          ?st eli:is_member_of ?stw .
          ?stw a sfl:Statute .
          FILTER NOT EXISTS {
            ?stw eli:in_force eli:InForce-notInForce .
          }
          ?st eli:is_realized_by ?ste .
          ?ste eli:title ?stt .
          FILTER (LANG(?stt) = 'fi')
        } UNION {
          ?c a skos:Concept .
          ?c skos:prefLabel ?l .
          (?c ?score) text:query (skos:prefLabel '${query}' 20) .
          VALUES ?matchType {'keyword'}
          ?s eli:has_member ?v.
          ?v eli:is_about ?c .
          ?v eli:is_realized_by ?e .
          ?e eli:is_embodied_by ?f .
          ?e eli:is_embodied_by ?f2 .
          ?f2 sfl:html ?txt .
          VALUES ?matchType {'content'}
          ?s a ?t .
          FILTER (?t IN ( sfl:Subsection, sfl:Section ) )
          OPTIONAL { ?e eli:title ?title } .
          ?v eli:is_part_of+ ?st .
          ?st eli:is_member_of ?stw .
          ?stw a sfl:Statute .
          FILTER NOT EXISTS {
            ?stw eli:in_force eli:InForce-notInForce .
          }
          ?st eli:is_realized_by ?ste .
          ?ste eli:title ?stt .
          FILTER (LANG(?stt) = 'fi')
        }
      } GROUP BY ?s ?v ?st ?stt ?c ?l ?t ?title ?txt ?score ?matchType ORDER BY DESC(?score) LIMIT 20
    `;
  },

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

    return `SELECT * ${fromGraph} WHERE {
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
  }
};

export default statuteQuery;
