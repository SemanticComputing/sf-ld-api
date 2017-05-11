class Prefix {

  constructor() {
    this.prefixesSparql =  `
      PREFIX common: <http://data.finlex.fi/common/>
      PREFIX dcterms: <http://purl.org/dc/terms/>
      PREFIX eli: <http://data.europa.eu/eli/ontology#>
      PREFIX sfcl: <http://data.finlex.fi/schema/sfcl/>
      PREFIX sfl: <http://data.finlex.fi/schema/sfl/>
      PREFIX sfecli: <http://data.finlex.fi/ecli/>
      PREFIX sfsd: <http://data.finlex.fi/eli/sd/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    `
    this.prefixes = {
      'http://purl.org/dc/terms/' : 'dcterms',
      'http://www.w3.org/2001/XMLSchema#' : 'xsd',
      'http://data.finlex.fi/common/' : 'common',
      'http://data.finlex.fi/schema/scfl/' : 'sfcl',
      'http://data.finlex.fi/schema/sfl/' : 'sfl',
      'http://data.finlex.fi/ecli/' : 'sfecli',
      'http://data.finlex.fi/eli/sd/' : 'sfsd',
      'http://data.europa.eu/eli/ontology#' : 'eli',
    };
  }

  shorten(uri) {
    for (const ns in this.prefixes) {
      if (uri.indexOf(ns)==0)
        return this.prefixes[ns]+':'+uri.substr(ns.length)
    }
    return uri
  }
}

const prefix = new Prefix();

export default prefix
