import React                    from 'react';
import { render }               from 'react-dom';
import { createBrowserHistory } from 'history'
import { Provider }             from 'react-redux';
import * as reducers            from 'reducers';
import App                      from 'App';
import { createStore,
         combineReducers }     from 'redux';

const history  = createBrowserHistory();
const reducer  = combineReducers(reducers);
const store    = createStore(reducer, {statutes: res.locals.data});

const initialView = (
  <Provider store={store}>
    <App history={history}/>
  </Provider>
);

const componentHtml = renderToString(initialView);

const initialState = window.__INITIAL_STATE__
