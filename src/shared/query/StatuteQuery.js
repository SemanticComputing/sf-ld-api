import moment from 'moment';
import eli from '../lib/eli';
import sfl from '../lib/sfl';

export default class StatuteQuery {


  constructor(params = {}) {

    this.vars = '*';

    // Get only CC BY data
    this.fromGraph = (params.hasOwnProperty('free')) ? ' FROM <http://data.finlex.fi/eli/sd/alkup>' : '';

    // Get version valid at a certain point in time
    this.versionDateFilter = params.pointInTime ?
      'FILTER (\"'+moment(params.pointInTime, 'YYYYMMDD').format('YYYY-MM-DD')+'\"^^xsd:date >= ?vd)' : '';
    // Default limit
    this.limit = params.limit ? 'LIMIT '+params.limit : (params.year) ? '':'LIMIT 10';

    // Offset
    this.offset = params.offset ? 'OFFSET '+params.offset : '';

    // Statutes by year
    this.statute = (params.year) ? '?statute a sfl:Statute . ?statute eli:id_local ?idLocal . FILTER regex(?idLocal, \"'+params.year+'$\", \"i\")' : '?statute a sfl:Statute .';

    // Statute by id
    this.statute = (params.statuteId) ? 'VALUES ?statute { sfsd:'+params.year+'\\/'+params.statuteId+' }' : this.statute;

    // Section of a law by id
    this.statute = (params.statuteId && params.sectionOfALaw) ? 'VALUES ?statute { sfsd:'+params.year+'\\/'+params.statuteId+params.sectionOfALaw.replace(/\//gi, '\\/')+' }' : this.statute;

    // Bind statute to variable s
    this.statuteBind = (params.statuteId) ? 'BIND(sfsd:'+params.year+'\\/'+params.statuteId+' AS ?s)' : '';

    // Bind section of a law to variable s
    this.statuteBind = (params.statuteId && params.sectionOfALaw) ? 'BIND(sfsd:'+params.year+'\\/'+params.statuteId+params.sectionOfALaw.replace(/\//gi, '\\/')+' AS ?s)' : this.statuteBind;

    // Filter by lang
    this.eliLangFilter = params.lang ? '?expression eli:language '+eli.getLangResource(params.lang)+'.' : '?expression eli:language '+eli.getLangResource('fi')+'.';

    // Filter by format
    this.formatFilter = '?format eli:format '+((params.format) ? eli.getFormatResource(params.format) : eli.getFormatResource('text'))+'.';
    this.content = '?format '+((params.format) ? sfl.getPropertyByFormat(params.format) : sfl.getPropertyByFormat('text'))+' ?content .';

    // Build document tree
    this.tree = (params.hasOwnProperty('tree')) ? '?statuteVersion eli:has_part* ?s .' : 'BIND(?statuteVersion AS ?s)';
    this.treeFilter = (params.hasOwnProperty('tree')) ? 'FILTER NOT EXISTS { ?s eli:has_part _:b . }' : '';

    // One by id
    this.selectVersion = (params.version == 'alkup') ?
      // Find original versions
      `
        ${this.statute}
        ?statute eli:has_member ?statuteVersion .
        ?statuteVersion eli:version sfl:Original .
      ` :
      // Find by version date
      `{
        SELECT DISTINCT ?statute (MAX(COALESCE(?vd, "")) AS ?versionDate) WHERE {
          ${this.statute}
          ?statute eli:has_member ?statuteVersion .
          OPTIONAL {
            ${this.versionDateFilter}
            ?statuteVersion eli:version_date ?vd .
          }
        } GROUP BY ?statute ${this.limit}
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
      FILTER(BOUND(?statuteVersion))`;

    // Many (by year)
    this.selectVersion = (!params.statuteId) ?  `
      {
        SELECT DISTINCT ?statute ?year ?number ?letter {
          ?statute a sfl:Statute .
          ?statute eli:has_member ?statuteVersion .
          ?statuteVersion eli:date_document ?date_document .
          ${params.year ? `FILTER (year(?date_document) = ${params.year})` : ''}
          BIND (YEAR(?date_document) AS ?year)
          ?statute eli:id_local ?id_local .
          BIND (xsd:integer(REPLACE(?id_local, "[^0-9]+[0-9]+", "")) AS ?number)
          BIND (REPLACE(?id_local, "[^A-Z]", "") AS ?letter)
        } ORDER BY ?year ?number ?letter ${this.limit} ${this.offset}
      }
      ?statute eli:has_member ?statuteVersion .
    ` : this.selectVersion;

    // Find by query
    this.query = (params.query) ? params.query.replace(/[^a-zA-ZäöåÄÖÅ0-9*"\s]/gi,'').toLowerCase() : '';
    this.regexQuery = (params.query) ? params.query.replace(/[^a-zA-ZäöåÄÖÅ0-9\s]/gi,'') : '';
  }


  findMany() {
    return `SELECT ${this.vars}${this.fromGraph} WHERE {
      ${this.selectVersion}
      # Statute must be found at this point
      FILTER(BOUND(?statute))
      ?statute eli:id_local ?idLocal .
      ?statute sfl:statuteType ?statuteType .
      ?statuteVersion eli:is_realized_by ?expression .
      ?statuteVersion a ?statuteVersionType .
      ${this.eliLangFilter}
      ?expression eli:title ?title .
      ?expression a ?expressionType .
    }`;
  }

  /*{
   ?c a skos:Concept .
   ?c skos:prefLabel ?l .
   FILTER(regex(LCASE(str(?l)), LCASE(\'${this.regexQuery}\') ) )
   FILTER(LANG(?l) = 'fi')
   VALUES ?score {100}
   VALUES ?matchType {'keyword'}
   ?s eli:has_member ?v.
   ?v eli:is_about ?c .
   ?v eli:is_realized_by ?e .
   ?e eli:language <http://publications.europa.eu/resource/authority/language/FIN>.
   ?e eli:title ?title .
 } UNION */
  findManyByQuery() {
    return `
      SELECT DISTINCT ?c ?l ?v ?s ?st ?stt ?t ?title ?txt ?score ?matchType WHERE {
       {
          ?e text:query (eli:title \'${this.query}\' 20) .
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
          (?f ?score) text:query (sfl:text \'${this.query}\' 20) .
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
        }
      } GROUP BY ?s ?v ?st ?stt ?c ?l ?t ?title ?txt ?score ?matchType ORDER BY DESC(?score) LIMIT 20
    `;
  }


  findOne() {
    return `SELECT ${this.vars} ${this.fromGraph} WHERE {
      {
        ${this.selectVersion}
        ${this.tree}
        ?s eli:is_realized_by ?expression .
        ${this.eliLangFilter}
        OPTIONAL {
          ?s ?p ?o .
          FILTER (?p!=eli:is_part_of)
          FILTER (?p!=eli:is_realized_by)
        }
        OPTIONAL {
          ?expression eli:title ?title .
        }
        OPTIONAL {
          ${this.treeFilter}
          ?expression eli:is_embodied_by ?format .
          ${this.formatFilter}
          ${this.content}
        }
      } UNION {
        ${this.statuteBind}
        ?s ?p ?o.
      }
    }`;
  }


}
