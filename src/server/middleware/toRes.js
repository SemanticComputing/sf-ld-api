import express                   from 'express';
import React                     from 'react';
import { renderToString }        from 'react-dom/server';
import { createMemoryHistory }   from 'history';
import * as jsonld               from 'jsonld';
import App                       from '../../shared/App';
import accept                    from './accept';

export default function toRes(req, res) {

  if (res.locals.err) {
    res.status(503);
    if (req.originalUrl.match(/(\.html)((\?){1}|$)/))
      return res.send('<!DOCTYPE html><html><body>Error: service unavailable</body></html>');
    else if (req.originalUrl.match(/(\.jsonld)((\?){1}|$)/))
      return res.send({error: 'Server error'});
  }

  else if (!res.locals.data) {
    res.status(404);
    if (req.originalUrl.match(/(\.html)((\?){1}|$)/))
      return res.send('<!DOCTYPE html><html><body>Error: resource not found</body></html>');
    else if (req.originalUrl.match(/(\.jsonld)((\?){1}|$)/))
      return res.send({error: 'Resource not found'});
  }

  res.status(200);
  if (req.originalUrl.match(/(\.html)((\?){1}|$)/)) {

    const history = createMemoryHistory(req.originalUrl);

    const InitialView = (
      <App data={res.locals.data} history={history}/>
    );

    const componentHtml = renderToString(InitialView);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Semanttinen Finlex</title>
          <link rel="stylesheet" href="/public/bundle.css">
          <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
          <script type="text/javascript" src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
          <script id="data" type="application/ld+json">
            ${JSON.stringify(res.locals.data, null , 2)}
          </script>
        </head>
        <body>
          <div id="react-view">${componentHtml}</div>
          <script type="application/javascript" src="/public/bundle.js"></script>
        </body>
      </html>
      `;

    res.end(html);
  }

  // JSON-LD is the preferred format
  else if (req.originalUrl.match(/(\.jsonld|\.json|\.rdf)((\?){1}|$)/))
    return res.send(res.locals.data);

  // N-Quads
  else if (req.originalUrl.match(/(\.nquads|\.nq|\.nt|\.ttl)((\?){1}|$)/)) {
    jsonld.toRDF(JSON.parse(res.locals.data), {format: 'application/nquads'}, function(err, nquads) {
      res.set('Content-Type', 'application/nquads');
      return res.send(nquads);
    });
  }

}
