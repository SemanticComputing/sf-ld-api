const conceptQuery = {

  findMany: (params) => {
    if (!params.query) {
      throw new Error('Empty query');
    }
    const query = params.query;
    const limit = parseInt(params.limit) ? 'LIMIT ' + params.limit : '';

    return `
      SELECT DISTINCT * WHERE {
        {
          # Text index
          {
            (?concept ?score) text:query (skos:prefLabel '${query}') .
            BIND (?concept AS ?s)
            ?s a skos:Concept .
            ?s (skos:prefLabel|skos:altLabel) ?sl .
            FILTER(LANG(?sl) = 'fi')
            VALUES ?st {
              'concept'
            }
          # With star
          } UNION {
            (?concept ?score) text:query (skos:prefLabel '${query}*' 3) .
            BIND (?concept AS ?s)
            ?s skos:prefLabel ?sl .
            FILTER (LANG(?sl) = 'fi')
            VALUES ?st {
              'star'
            }
          # Narrower terms
          } UNION {
            (?concept ?score) text:query (skos:prefLabel '${query}') .
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
            (?concept ?score) text:query (skos:prefLabel '${query}') .
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
              (?concept ?score) text:query (skos:prefLabel '${query}') .
              BIND (?concept AS ?s)
              ?s a skos:Concept .
              ?s (skos:prefLabel|skos:altLabel) ?sl .
              FILTER(LANG(?sl) = 'fi')
              VALUES ?st {
                'concept'
              }
            # With star
            } UNION {
              (?concept ?score) text:query (skos:prefLabel '${query}*' 3) .
              BIND (?concept AS ?s)
              ?s skos:prefLabel ?sl .
              FILTER (LANG(?sl) = 'fi')
              VALUES ?st {
                'star'
              }
            # Narrower terms
            } UNION {
              (?concept ?score) text:query (skos:prefLabel '${query}') .
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
              (?concept ?score) text:query (skos:prefLabel '${query}') .
              ?concept skos:prefLabel ?cl .
              ?concept skos:related ?s .
              ?s skos:prefLabel ?sl .
              FILTER (LANG(?cl) = 'fi')
              FILTER (LANG(?sl) = 'fi')
              VALUES ?st {
                'related'
              }
            }
            ?concept skos:inScheme ?sch .
          }
        }
      } ORDER BY DESC(?score) ${limit}
    `;
  }
};

export default conceptQuery;
