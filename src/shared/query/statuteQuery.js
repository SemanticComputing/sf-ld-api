import moment from 'moment';
import eli from '../lib/eli';
import sfl from '../lib/sfl';

const FREE_GRAPH = '<http://data.finlex.fi/eli/sd/alkup>';
const DEFAULT_LIMIT = 10;
const PART_PROPERTIES = `
  OPTIONAL { ?part a ?type .  }
  OPTIONAL { ?part eli:amended_by ?amendedBy .  }
  OPTIONAL { ?part eli:amends ?amends .  }
  OPTIONAL { ?part eli:based_on ?basedOn .  }
  OPTIONAL { ?part eli:cites ?cites .  }
  OPTIONAL { ?part eli:date_document ?dateDocument .  }
  OPTIONAL { ?part eli:date_publication ?datePublication .  }
  OPTIONAL { ?part eli:first_date_entry_in_force ?firstDateEntryInForce .  }
  OPTIONAL { ?part eli:has_part ?hasPart .  }
  OPTIONAL { ?part eli:is_about ?isAbout .  }
  OPTIONAL { ?part eli:is_member_of ?isMemberOf .  }
  OPTIONAL { ?part eli:related_to ?relatedTo .  }
  OPTIONAL { ?part eli:repealed_by ?repealedBy .  }
  OPTIONAL { ?part eli:repeals ?repeals .  }
  OPTIONAL { ?part eli:responsibility_of ?responsibilityOf .  }
  OPTIONAL { ?part eli:version ?version .  }
  OPTIONAL { ?part eli:version_date ?versionDate .  }
  OPTIONAL { ?part sfl:followedBy ?followedBy .  }
  `;

const statuteQuery = {

  findOne: (params) => {
    const refinedParams = {};

    refinedParams.sectionOfALaw = params.sectionOfALaw ? params.sectionOfALaw.replace(/\//gi, '\\/') : '';
    refinedParams.statuteUri = `sfsd:${params.year}\\/${params.statuteId}${refinedParams.sectionOfALaw}`;
    refinedParams.fromGraph = params.free ? `FROM ${FREE_GRAPH}` : '';
    refinedParams.versionDateFilter = params.pointInTime ?
        `FILTER ("${moment(params.pointInTime, 'YYYYMMDD').format('YYYY-MM-DD')}"^^xsd:date >= ?vd)` : '';
    refinedParams.lang = eli.getLangResource(params.lang || 'fi');
    refinedParams.format = eli.getFormatResource(params.format || 'text');
    refinedParams.tree = params.hasOwnProperty('tree') ? '?statuteVersion eli:has_part* ?part .' : 'BIND(?statuteVersion AS ?part)';
    refinedParams.treeFilter = params.hasOwnProperty('tree') ? 'FILTER NOT EXISTS { ?part eli:has_part [] . }' : '';
    refinedParams.contentProperty = sfl.getPropertyByFormat(params.format || 'text');

    if (params.version === 'alkup') {
      return getOriginal(refinedParams);
    }
    if (refinedParams.treeFilter) {
      return getDeep(refinedParams);
    }
    return getShallow(refinedParams);
  },

  findMany: (params) => {
    const fromGraph = params.free ? `FROM ${FREE_GRAPH}` : '';
    const yearFilter = params.year ? `FILTER(?year = "${params.year}"^^xsd:gYear)` : '';
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
    ?statute sfl:year ?year .
    ${params.yearFilter}
    ${params.original}
    ?statute sfl:statuteNumber ?number .
    ?statute eli:id_local ?idLocal .
    BIND(REPLACE(?number, "[^A-Z]", "") AS ?letter)
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
    ?statute sfl:year ?year .
    ${params.yearFilter}
    ?statute sfl:statuteNumber ?number .
    BIND(REPLACE(?number, "[^A-Z]", "") AS ?letter)
    ?expression eli:language ${params.lang} .`;
}

function getOriginal(params) {
  return `SELECT DISTINCT * ${params.fromGraph} WHERE {
    {
      VALUES ?statute { ${params.statuteUri} }
      ?statute eli:has_member ?statuteVersion .
      ?statuteVersion eli:version sfl:Original .
      ${params.tree}
      ?part eli:is_realized_by ?expression .
      ?expression eli:language ${params.lang} .
      OPTIONAL {
        ?expression eli:title ?title .
      }
      OPTIONAL {
        ${params.treeFilter}
        ?expression eli:is_embodied_by ?format .
        ?format eli:format ${params.format} .
        ?format ${params.contentProperty} ?content .
      }
    } UNION {
      VALUES ?part { ${params.statuteUri} }
      ?part ?p ?o.
    } UNION {
      VALUES ?statute { ${params.statuteUri} }
      ?statute eli:has_member ?statuteVersion .
      ?statuteVersion eli:version sfl:Original .
      ${params.tree}
      ?part eli:is_realized_by ?expression .
      ${PART_PROPERTIES}
    }
  }`;
}

function getShallow(params) {
  return `SELECT DISTINCT * ${params.fromGraph} WHERE {
    {
      {
        SELECT DISTINCT ?statute (MAX(COALESCE(?vd, "")) AS ?versionDate) WHERE {
          VALUES ?statute { ${params.statuteUri} }
          ?statute eli:has_member ?statuteVersion .
          OPTIONAL {
            ?statuteVersion eli:version_date ?vd .
            ${params.versionDateFilter}
          }
        } GROUP BY ?statute
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
      ?statuteVersion a ?statuteVersionType .
      BIND(?statuteVersion AS ?part)
      ${PART_PROPERTIES}
    } UNION {
      BIND(${params.statuteUri} AS ?part)
      ?part eli:id_local ?idLocal .
      ?part eli:type_document ?typeDocument .
      ?part sfl:statuteType ?type .
      OPTIONAL { ?part eli:has_member ?temporalVersions . }
      OPTIONAL { ?part eli:in_force ?inForce . }
    } UNION {
      # Get the content separately as it can be quite large so we only want it once.
      # Otherwise the result is huge.
      {
        SELECT DISTINCT ?statute (MAX(COALESCE(?vd, "")) AS ?versionDate) WHERE {
          VALUES ?statute { ${params.statuteUri} }
          ?statute eli:has_member ?statuteVersion .
          OPTIONAL {
            ?statuteVersion eli:version_date ?vd .
            ${params.versionDateFilter}
          }
        } GROUP BY ?statute
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
      BIND(?statuteVersion AS ?part)
      ?statuteVersion eli:is_realized_by ?expression .
      ?expression eli:language ${params.lang} .
      ?expression eli:title ?title .
      ?expression eli:is_embodied_by ?format .
      ?format eli:format ${params.format} .
      ?format ${params.contentProperty} ?content .
    }
  }`;
}

function getDeep(params) {
  return `SELECT DISTINCT * ${params.fromGraph} WHERE {
    {
      {
        SELECT DISTINCT ?statute (MAX(COALESCE(?vd, "")) AS ?versionDate) WHERE {
          VALUES ?statute { ${params.statuteUri} }
          ?statute eli:has_member ?statuteVersion .
          OPTIONAL {
            ?statuteVersion eli:version_date ?vd .
            ${params.versionDateFilter}
          }
        } GROUP BY ?statute
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
      ?statuteVersion eli:has_part* ?part .
      ?part eli:is_realized_by ?expression .
      ?expression eli:language ${params.lang} .
      OPTIONAL {
        ?expression eli:title ?title .
      }
      OPTIONAL {
        FILTER NOT EXISTS { ?part eli:has_part [] . }
        ?expression eli:is_embodied_by ?format .
        ?format eli:format ${params.format} .
        ?format ${params.contentProperty} ?content .
      }
      ${PART_PROPERTIES}
    } UNION {
      BIND(${params.statuteUri} AS ?part)
      ?part eli:id_local ?idLocal .
      ?part eli:type_document ?typeDocument .
      ?part sfl:statuteType ?type .
      OPTIONAL { ?part eli:has_member ?temporalVersions . }
      OPTIONAL { ?part eli:in_force ?inForce . }
    }
  }`;
}

export default statuteQuery;
