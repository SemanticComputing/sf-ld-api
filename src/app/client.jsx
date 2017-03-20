import React                    from 'react';
import { render }               from 'react-dom';
import { createHistory }        from 'history'
import { Provider }             from 'react-redux';
import * as reducers            from './reducers';
import App                      from './App.jsx';
import { createStore,
         combineReducers }      from 'redux';

const history  = createHistory();
const reducer  = combineReducers(reducers);
const initialState = window.__INITIAL_STATE__
const store    = createStore(reducer, initialState);

const initialView = (
  <Provider store={store}>
    <App history={history}/>
  </Provider>
);

render(initialView, document.getElementById('react-view'));

