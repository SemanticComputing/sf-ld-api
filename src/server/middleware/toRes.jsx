import express                   from 'express';
import React                     from 'react';
import { renderToString }        from 'react-dom/server'
import { createMemoryHistory }   from 'history';
import App                       from '../../shared/App';
import { Provider }              from 'react-redux';
import * as reducers             from '../../shared/reducers';
import accept                    from './accept';
import { createStore,
         combineReducers }       from 'redux';

export default function toRes(req, res) {

  console.log('to res')
  console.log(res.locals.err)

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
    const history  = createMemoryHistory(req.url);
    const reducer  = combineReducers(reducers);
    const store    = createStore(reducer, {statutes: res.locals.data});

    const InitialView = (
      <Provider store={store}>
        <App history={history}/>
      </Provider>
    );

    const componentHtml = renderToString(InitialView);

    const initialState = store.getState();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Semanttinen Finlex</title>
          <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
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
  else if (req.originalUrl.match(/(.jsonld)((\?){1}|$)/))
    return res.send(res.locals.data)

}