export default (req, res, next) => {
  // Redirect legacy ECLI url to new one
  var matches = req.originalUrl.match(/(.*)ECLI:FI:(KKO|KHO):(\d{4}):([A-Za-z0-9]{1,16})(\/fi|\/sv|\/fin|\/swe)?(\/xml|\/html|\/txt|\/text)?(.*)?/);
  if (matches) {
    var newUrl = '/ecli';
    if (matches[2]) newUrl += '/'+matches[2].toLowerCase();
    if (matches[3]) newUrl += '/'+matches[3];
    if (matches[4]) newUrl += '/'+matches[4];
    if (matches[5]) newUrl += '/'+matches[5];
    if (matches[6]) newUrl += '/'+matches[6];
    return res.redirect(303, newUrl);
  }
  else return next();
}
