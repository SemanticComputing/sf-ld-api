import React                    from 'react';
import { render }               from 'react-dom';
import { createHistory }        from 'history';
import $ from 'jquery';
import App                      from '../shared/App';

const history  = createHistory();
const initialState = window.__INITIAL_STATE__;

const initialView = (
    <App data={JSON.parse($('script#data').text())} history={history}/>
);

render(initialView, document.getElementById('react-view'));
