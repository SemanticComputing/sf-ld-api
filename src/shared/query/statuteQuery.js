import moment from 'moment';
import eli from '../lib/eli';
import sfl from '../lib/sfl';

export default class StatuteQuery {

  constructor(params = {}) {
    console.log(params)
    this.vars = '*';
    // Get version valid at a certain point in time
    this.versionDateFilter = params.pointInTime ?
      'FILTER (\"'+moment(params.pointInTime, 'YYYYMMDD').format('YYYY-MM-DD')+'\"^^xsd:date >= ?vd)' : '';
    // Default limit
    this.limit = params.limit ? 'LIMIT '+params.limit : (params.year) ? '':'LIMIT 10';
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
    // Original or consolidated
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
        FILTER(?versionDate = "") .
        ?statuteVersion eli:version sfl:Original .
      }
      FILTER(BOUND(?statuteVersion))`;
  }

  findMany() {
    return `SELECT ${this.vars} WHERE {
      ${this.selectVersion}
      ?statute eli:id_local ?idLocal .
      ?statute eli:has_member ?hasVersion .
      ?statute a ?statuteType .
      ?statuteVersion eli:is_realized_by ?expression .
      ?statuteVersion a ?statuteVersionType .
      ${this.eliLangFilter}
      ?expression eli:title ?title .
      ?expression a ?expressionType .
    }`
  }

  findOne() {
    return `SELECT ${this.vars} WHERE {
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
    }`
  }

}
