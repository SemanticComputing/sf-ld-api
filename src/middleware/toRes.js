import accept from '../middleware/accept'

export default function toRes(req, res) {

  if (res.locals.err) {
    res.status(500)
    if (req.originalUrl.match(/(.html)$/))
      return res.send('<!DOCTYPE html><html><body>SERVER ERROR</body></html>')
    else if (req.originalUrl.match(/(.jsonld)$/))
      return res.send({error: "Server error"})
  }

  else if (!res.locals.data) {
    res.status(400)
    if (req.originalUrl.match(/(.html)$/))
      return res.send('<!DOCTYPE html><html><body>NOT FOUND</body></html>')
   else if (req.originalUrl.match(/(.jsonld)$/))
      return res.send({error: "Not found"})
  }

  res.status(200)
  if (req.originalUrl.match(/(.html)$/))
    return res.send('<!DOCTYPE html><html><body>HERE COMES</body></html>')
  else if (req.originalUrl.match(/(.jsonld)$/))
    return res.send(res.locals.data)

}
