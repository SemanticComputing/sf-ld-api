import express                   from 'express';
import React                     from 'react';
import { renderToString }        from 'react-dom/server'
import { createMemoryHistory }   from 'history';
import * as jsonld               from 'jsonld';
import App                       from '../../shared/App';
import { Provider }              from 'react-redux';
import * as reducers             from '../../shared/reducers';
import accept                    from './accept';
import { createStore,
         combineReducers }       from 'redux';

export default function toRes(req, res) {

  if (res.locals.err) {
    res.status(500)
    if (req.originalUrl.match(/(.html)((\?){1}|$)/))
      return res.send('<!DOCTYPE html><html><body>SERVER ERROR</body></html>')
    else if (req.originalUrl.match(/(.jsonld)((\?){1}|$)/))
      return res.send({error: "Server error"})
  }

  else if (!res.locals.data) {
    res.status(400)
    if (req.originalUrl.match(/(.html)((\?){1}|$)/))
      return res.send('<!DOCTYPE html><html><body>NOT FOUND</body></html>')
   else if (req.originalUrl.match(/(.jsonld)((\?){1}|$)/))
      return res.send({error: "Not found"})
  }

  res.status(200)
  if (req.originalUrl.match(/(.html)((\?){1}|$)/)) {

    // Remove content from metadata
    const removeContent = (obj) => {
      for (let [prop, value] of Object.entries(obj)) {
        if (prop === 'content_fi' || prop === 'content_sv')
          delete obj[prop];
        else if (typeof obj[prop] === 'object') {
          removeContent(obj[prop]);
        }
      }
      return obj;
    }

    const history  = createMemoryHistory(req.url);
    const reducer  = combineReducers(reducers);
    const store    = createStore(reducer, {data: res.locals.data});

    const InitialView = (
      <Provider store={store}>
        <App data={res.locals.data} history={history}/>
      </Provider>
    );

    const componentHtml = renderToString(InitialView);

    const initialState = store.getState();

    // @TODO: This goes inside inside head script tags
    // window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Semanttinen Finlex</title>
          <link rel="stylesheet" href="/public/bundle.css">
          <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
          <script type="application/ld+json">
            ${JSON.stringify(removeContent(JSON.parse(res.locals.data)), null , 2)}
          </script>
        </head>
        <body>
          <div id="react-view">${componentHtml}</div>
          <!--<script type="application/javascript" src="/public/bundle.js"></script>-->
        </body>
      </html>
      `;

    res.end(html);
  }

  // JSON-LD is the preferred format
  else if (req.originalUrl.match(/(.jsonld|.json|.rdf)((\?){1}|$)/))
    return res.send(res.locals.data)

  // Serialize other requests to N-Quads (RDF), for now
  else if (req.originalUrl.match(/(.nquads|.nq|.nt|.ttl)((\?){1}|$)/)) {
    jsonld.toRDF(JSON.parse(res.locals.data), {format: 'application/nquads'}, function(err, nquads) {
      res.set('Content-Type', 'application/nquads');
      return res.send(nquads)
    });
  }

}
