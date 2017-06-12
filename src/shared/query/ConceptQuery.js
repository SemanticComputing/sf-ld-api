import moment from 'moment';

export default class ConceptQuery {

  constructor(params = {}) {
    this.vars = '*';
    this.query = params.query ? params.query.toLowerCase() : '';
  }


  findMany() {
    return `
      # ?s ?sl ?sn ?snl ?sch
      SELECT DISTINCT ${this.vars} WHERE {
        # Text index
        ${this.query ? '(?s ?score) text:query (skos:prefLabel \''+this.query+'\') .':''}
        ?s a skos:Concept .
        ?s (skos:prefLabel|skos:altLabel) ?sl .
        FILTER(LANG(?sl) = 'fi')
        VALUES ?sch {
        	<http://www.yso.fi/onto/liito/conceptscheme>
        }
        ?s skos:inScheme ?sch .
        # Narrower terms
        OPTIONAL {
        	?s skos:narrower ?sn .
        	?sn skos:prefLabel ?snl .
        	FILTER (LANG(?snl) = 'fi')
        }
        # Related terms
        OPTIONAL {
          ?s skos:related ?sr .
        	?sr skos:prefLabel ?srl .
        	FILTER (LANG(?srl) = 'fi')
        }
      }
      ORDER BY DESC(?score) LIMIT 10
    `
  }


  findOne() {
    // ...
  }


}
