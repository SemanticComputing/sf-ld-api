export default (header) => {
  if (header.indexOf('text/html') > -1) return 'text/html'
  else if (header.indexOf('application/ld+json')) return 'application/ld+json'
  else return ''
}
