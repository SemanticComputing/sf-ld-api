export default (header) => {
  if (header.indexOf('text/html') > -1) return 'text/html'
  else if (header.indexOf('application/json') > -1) return 'application/json'
  else if (header.indexOf('application/ld+json') > -1) return 'application/ld+json'
  else return ''
}
