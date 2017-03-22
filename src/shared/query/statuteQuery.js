import moment from 'moment';
import eli from '../lib/eli';
import sfl from '../lib/sfl';

export default class StatuteQuery {

  constructor(params = {}) {
    console.log(params)
    this.vars = '*';
    this.versionDateFilter = params.pointInTime ?
      'FILTER (\"'+moment(params.versiondate, 'YYYYMMDD').format('YYYY-MM-DD')+'\"^^xsd:date >= ?vd)' : '';
    this.limit = params.limit ? 'LIMIT '+params.limit : '';
    this.statute = (params.year) ? '?statute a sfl:Statute . ?statute eli:id_local ?idLocal . FILTER regex(?idLocal, \"'+params.year+'$\", \"i\")' : '';
    this.statute = (params.statuteId) ? 'VALUES ?statute { sfsd:'+params.year+'\\/'+params.statuteId+' }' : this.statute;
    this.statuteBind = (params.statuteId) ? 'BIND(sfsd:'+params.year+'\\/'+params.statuteId+' AS ?s)' : '';
    this.eliLangFilter = params.lang ? '?expression eli:language '+eli.getLangResource(params.lang)+'.' : '?expression eli:language '+eli.getLangResource('fi')+'.';
    this.formatFilter = '?format eli:format '+((params.format) ? eli.getFormatResource(params.format) : eli.getFormatResource('text'))+'.';
    this.content = '?format '+((params.format) ? sfl.getPropertyByFormat(params.format) : sfl.getPropertyByFormat('text'))+' ?content .';
    this.tree = (params.hasOwnProperty('tree')) ? '?statuteVersion eli:has_part* ?s .' : 'BIND(?statuteVersion AS ?s)';
    this.treeFilter = (params.hasOwnProperty('tree')) ? 'FILTER NOT EXISTS { ?s eli:has_part _:b . }' : '';
    this.selectVersion = `{
        SELECT ?statute (MAX(COALESCE(?vd, "")) AS ?versionDate) WHERE {
          ${this.statute}
          ?statute sfl:hasVersion ?statuteVersion .
          OPTIONAL {
            ${this.versionDateFilter}
            ?statuteVersion eli:version_date ?vd .
          }
        } GROUP BY ?statute ${this.limit}
      }
      # Matching consolidated version
      OPTIONAL {
        ?statute sfl:hasVersion ?statuteVersion .
        ?statuteVersion eli:version_date ?versionDate .
      }
      # No matching consolidated version
      OPTIONAL {
        ?statute sfl:hasVersion ?statuteVersion .
        FILTER(?versionDate = "") .
        ?statuteVersion eli:version sfl:Original .
      }
      FILTER(BOUND(?statuteVersion))`
  }

  findMany() {
    return `SELECT ${this.vars} WHERE {
      ${this.selectVersion}
      ?statute eli:id_local ?idLocal .
      ?statute sfl:hasVersion ?hasVersion .
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
        {
          SELECT ?statute (MAX(COALESCE(?vd, "")) AS ?versionDate) WHERE {
            ${this.statute}
            ?statute sfl:hasVersion ?statuteVersion .
            OPTIONAL {
              ${this.versionDateFilter}
              ?statuteVersion eli:version_date ?vd .
            }
          } GROUP BY ?statute ${this.limit}
        }
        # Matching consolidated version
        OPTIONAL {
          ?statute sfl:hasVersion ?statuteVersion .
          ?statuteVersion eli:version_date ?versionDate .
        }
        # No matching consolidated version
        OPTIONAL {
          ?statute sfl:hasVersion ?statuteVersion .
          FILTER(?versionDate = "") .
          ?statuteVersion eli:version sfl:Original .
        }
        FILTER(BOUND(?statuteVersion))
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

  /* slower way...
  SELECT DISTINCT ?statute ?statuteVersion ?title WHERE {
    ?statute a sfl:Statute ;
      sfl:hasVersion ?statuteVersion .
    OPTIONAL {
      ?statuteVersion eli:version_date ?date .
    }
    FILTER NOT EXISTS {
      ?statute sfl:hasVersion ?statuteVersion2 .
      FILTER (?statuteVersion2 != ?statuteVersion)
      ?statuteVersion2 eli:version_date ?date2 .
      FILTER (?date2 > ?date || !BOUND(?date))
    }
    ?statuteVersion eli:is_realized_by ?statuteExpression .
    ?statuteExpression eli:language <http://publications.europa.eu/resource/authority/language/FIN> ;
      eli:title ?title .
    } GROUP BY ?statute ?statuteVersion ?title LIMIT 2
*/
