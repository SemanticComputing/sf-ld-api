import eli from '../lib/eli'

export default class StatuteQuery {

  constructor(params = {}) {
    const defaultLimit = 10
    this.vars = "?statute ?idLocal"
    this.limit = params.limit ? "LIMIT "+params.limit : "LIMIT "+defaultLimit
    this.eliLangFilter = params.lang ?
      "?version eli:language "+eli.getLangResource(params.lang)+"." : ""
  }

  findMany() {
    console.log(this)
    return `SELECT ${this.vars} WHERE {
      ?statute a sfl:Statute .
      ?statute eli:id_local ?idLocal .
      ?statute sfl:hasVersion ?statuteVersion .
      ${this.eliLangFilter}
      ?version eli:title ?title .
    } ${this.limit}`
  }

}
