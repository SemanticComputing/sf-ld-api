import moment from 'moment';
import sfcl from '../lib/sfcl';

export default class JudgmentQuery {

  constructor(params = {}) {
    console.log(params)

    this.vars = '*';
    // Default limit
    this.limit = params.limit ? 'LIMIT '+params.limit : (params.year) ? '':'LIMIT 10';
    // Judgments by year
    this.judgment = (params.year) ? '?judgment a sfcl:Judgment . ?judgment dcterms:date ?date .  FILTER(year(?date) = '+parseInt(params.year)+')' : '?judgment a sfcl:Judgment .';
    // Judgment by id
    this.judgment = (params.judgmentId) ? 'VALUES ?judgment { sfecli:'+params.year+'\\/'+params.judgmentId+' }' : this.judgment;
    // Filter by lang
    this.ecliLangFilter = params.lang ? '?expression dcterms:language "'+params.lang+'".' : '?expression dcterms:language "fi".';
    // Filter by format
    this.content = '?format a sfcl:Format . ?format '+((params.format) ? sfcl.getPropertyByFormat(params.format) : sfcl.getPropertyByFormat('text'))+' ?content .';
    // Bind judgment to variable j
    this.judgmentBind = (params.judgmentId) ? 'BIND(sfecli:'+params.year+'\\/'+params.judgmentId+' AS ?j)' : '';
  }

  findMany() {
    return `SELECT ${this.vars} WHERE {
      ${this.judgment}
      ?judgment a ?judgmentType .
      ?judgment dcterms:isVersionOf ?ecli .
      ?judgment sfcl:isRealizedBy ?expression .
      ${this.ecliLangFilter}
      ?expression dcterms:title ?title .
      ?expression a ?expressionType .
    } ${this.limit}`
  }

  findOne() {
    return `SELECT ${this.vars} WHERE {
      {
        ${this.judgment}
        ?judgment dcterms:isVersionOf ?ecli .
        ?judgment sfcl:isRealizedBy ?expression .
        ${this.ecliLangFilter}
        ?expression dcterms:title ?title .
        ?expression a ?expressionType .
        ?expression sfcl:isEmbodiedBy ?format .
        ${this.content}
      }
      UNION {
       ${this.judgmentBind}
       ?j ?p ?o.
      }
    }`
  }

}
