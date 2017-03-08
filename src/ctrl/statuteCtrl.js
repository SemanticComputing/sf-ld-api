class StatuteCtrl {

  find(req, res, next) {
    console.log('statute?')
    res.locals.data = {id:1}
    return next()
  }

}

let statuteCtrl = new StatuteCtrl()

export default statuteCtrl
