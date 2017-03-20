import moment from 'moment';
import eli from '../lib/eli';

export default class StatuteQuery {

  constructor(params = {}) {
    console.log(params)
    const defaultLimit = 10
    this.vars = "*"; //"?statute ?idLocal ?statuteVersion ?expression ?title"
    this.versionDateFilter = params.pointInTime ?
      'FILTER (\"'+moment(params.versiondate, 'YYYYMMDD').format('YYYY-MM-DD')+'\"^^xsd:date >= ?vd)' : '';
    this.limit = params.limit ? "LIMIT "+params.limit : "LIMIT "+defaultLimit;
    this.eliLangFilter = params.lang ?
      "?expression eli:language "+eli.getLangResource(params.lang)+"." : "";
    this.statute = (params.year) ? '?statute eli:id_local ?idLocal . FILTER regex(?idLocal, \"'+params.year+'$\", \"i\")' : '';
    this.statute = (params.statuteId) ? 'VALUES ?statute { sfsd:'+params.year+'\/'+params.statuteId+' }' : this.statute;
  }

  find() {
    return `SELECT ${this.vars} WHERE {
      {
        SELECT ?statute (MAX(COALESCE(?vd, "")) AS ?versionDate) WHERE {
          ?statute a sfl:Statute .
          ${this.statute}
          ?statute sfl:hasVersion ?statuteVersion .
          OPTIONAL {
            ${this.versionDateFilter}
            ?statuteVersion eli:version_date ?vd .
          }
        } GROUP BY ?statute ${this.limit}
      }
      ?statute eli:id_local ?idLocal .
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
      ?statuteVersion eli:is_realized_by ?expression .
      ${this.eliLangFilter}
      ?expression eli:title ?title .
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
