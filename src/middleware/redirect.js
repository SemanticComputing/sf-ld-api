import Router from 'express'
import accept from './accept'

export default (req, res, next) => {

  if (req.originalUrl.match(/(.jsonld|.html)$/)) {
    return next()
  } else {
    switch(accept(req.get('Accept'))) {
      case '':
        return res.status(400).send({ error: 'Not found' })
        break
      case 'text/html':
        res.header('Accept', 'text/html')
        return res.redirect(303, req.originalUrl+'.html')
        break
      case 'application/ld+json':
        res.header('Accept', 'application/ld+json')
        return res.redirect(303, req.originalUrl+'.jsonld')
        break
    }
  }
}
