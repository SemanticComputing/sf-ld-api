export default class Statute {

  constructor(id, bindings) {
    this.data = {}
    this.data.id: id,
    Object.assign(this.data, this.data, bindings)
  }

}
