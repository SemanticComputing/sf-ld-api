import moment from 'moment';

export default class ConceptQuery {

  constructor(params = {}) {
    this.vars = '*';
    this.query = params.query ? params.query.toLowerCase() : '';
    this.limit = parseInt(params.limit) ? 'LIMIT '+params.limit : '';
  }


  findMany() {
    return `
      SELECT DISTINCT ${this.vars} WHERE {
        {
          # Text index
          {
            ${this.query ? '(?concept ?score) text:query (skos:prefLabel \''+this.query+'\') .':''}
            BIND (?concept AS ?s)
            ?s a skos:Concept .
            ?s (skos:prefLabel|skos:altLabel) ?sl .
            FILTER(LANG(?sl) = 'fi')
            VALUES ?st {
              'concept'
            }
          # With star
          } UNION {
            ${this.query ? '(?concept ?score) text:query (skos:prefLabel \''+this.query+'*\' 3) .':''}
            BIND (?concept AS ?s)
            ?s skos:prefLabel ?sl .
            FILTER (LANG(?sl) = 'fi')
            VALUES ?st {
              'star'
            }
          # Narrower terms
          } UNION {
            ${this.query ? '(?concept ?score) text:query (skos:prefLabel \''+this.query+'\') .':''}
            ?concept skos:prefLabel ?cl .
            ?concept skos:narrower ?s .
            ?s skos:prefLabel ?sl .
            FILTER (LANG(?cl) = 'fi')
            FILTER (LANG(?sl) = 'fi')
            VALUES ?st {
              'narrower'
            }
          # Related terms
          } UNION {
            ${this.query ? '(?concept ?score) text:query (skos:prefLabel \''+this.query+'\') .':''}
            ?concept skos:prefLabel ?cl .
            ?concept skos:related ?s .
            ?s skos:prefLabel ?sl .
            FILTER (LANG(?cl) = 'fi')
            FILTER (LANG(?sl) = 'fi')
            VALUES ?st {
              'related'
            }
          }
          VALUES ?sch {
            <http://www.yso.fi/onto/liito/conceptscheme>
          }
          ?concept skos:inScheme ?sch .
        } UNION {
          SERVICE <http://data.finlex.fi/sparql> {
            # Text index
            {
              ${this.query ? '(?concept ?score) text:query (skos:prefLabel \''+this.query+'\') .':''}
              BIND (?concept AS ?s)
              ?s a skos:Concept .
              ?s (skos:prefLabel|skos:altLabel) ?sl .
              FILTER(LANG(?sl) = 'fi')
              VALUES ?st {
                'concept'
              }
            # With star
            } UNION {
              ${this.query ? '(?concept ?score) text:query (skos:prefLabel \''+this.query+'*\' 3) .':''}
              BIND (?concept AS ?s)
              ?s skos:prefLabel ?sl .
              FILTER (LANG(?sl) = 'fi')
              VALUES ?st {
                'star'
              }
            # Narrower terms
            } UNION {
              ${this.query ? '(?concept ?score) text:query (skos:prefLabel \''+this.query+'\') .':''}
              ?concept skos:prefLabel ?cl .
              ?concept skos:narrower ?s .
              ?s skos:prefLabel ?sl .
              FILTER (LANG(?cl) = 'fi')
              FILTER (LANG(?sl) = 'fi')
              VALUES ?st {
                'narrower'
              }
            # Related terms
            } UNION {
              ${this.query ? '(?concept ?score) text:query (skos:prefLabel \''+this.query+'\') .':''}
              ?concept skos:prefLabel ?cl .
              ?concept skos:related ?s .
              ?s skos:prefLabel ?sl .
              FILTER (LANG(?cl) = 'fi')
              FILTER (LANG(?sl) = 'fi')
              VALUES ?st {
                'related'
              }
            }
            #VALUES ?sch {
            #  <http://data.finlex.fi/voc/finlex/>
            #}
            ?concept skos:inScheme ?sch .
          }
        }
      } ORDER BY DESC(?score) ${this.limit}
    `;
  }

  /*findMany() {
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
      } ORDER BY DESC(?score) ${this.limit}
    `
  }*/


  findOne() {
    // ...
  }


}
