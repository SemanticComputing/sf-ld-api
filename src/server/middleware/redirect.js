import Router from 'express';
import accept from './accept';

export default (req, res, next) => {

  const addExtensionToUrl = (extension) => {
    return req.originalUrl.split('?')[0]+'.'+extension+(req.originalUrl.split('?')[1] ? '?'+req.originalUrl.split('?')[1] : '');
  };

  const addExtensionToUrlLegacy = (extension) => {
    return req.originalUrl.split('?')[0]+'.'+extension+(req.originalUrl.split('?')[1] ? '?'+req.originalUrl.split('?')[1] : '');
  };

  if (req.originalUrl.match(/(\.js((\?){1}|$)|\.xml((\?){1}|$)|\.map((\?){1}|$)|\.nt((\?){1}|$)|\.jpg((\?){1}|$)|\.png((\?){1}|$)|\.ttl((\?){1}|$)|\.rdf((\?){1}|$)|\.css((\?){1}|$)|\.nq((\?){1}|$)|\.nquads((\?){1}|$)|\.json((\?){1}|$)|\.jsonld((\?){1}|$)|\.html((\?){1}|$)|\.zip((\?){1}|$))/)) {
    return next();
  } else {
    switch(accept(req.get('Accept'))) {
      case '':
        return res.status(400).send({ error: 'Not found' });
        break;
      case 'text/html':
        res.header('Accept', 'text/html');
        return res.redirect(303, addExtensionToUrlLegacy('html'));
        break;
      case 'application/json':
      case 'application/ld+json':
        res.header('Accept', 'application/ld+json');
        return res.redirect(303, addExtensionToUrl('jsonld'));
        break;
    }
  }
};
