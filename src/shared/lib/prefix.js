class Prefix {

  constructor() {
    this.prefixesSparql =  `prefix eli: <http://data.europa.eu/eli/ontology#>
      prefix sfl: <http://data.finlex.fi/schema/sfl/>
      prefix sfsd: <http://data.finlex.fi/eli/sd/>
      prefix xsd: <http://www.w3.org/2001/XMLSchema#>`
    this.prefixes = {
      'http://www.w3.org/2001/XMLSchema#' : 'xsd',
      'http://data.finlex.fi/schema/sfl/' : 'sfl',
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
