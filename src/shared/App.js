import React                   from 'react';
import { Router, Route }       from 'react-router';
import StatuteList             from './components/StatuteList.js';
import Statute                 from './components/Statute.js';

export default class App extends React.Component {
  render() {
    return (
      <div className="app">
        <header>
          <img className="sf-logo" src={'/images/sf-logo.png'}/>
          <h1>Semanttinen Finlex</h1>
          <nav className="main-navigation pull-right">
            <a href="/">Dokumentaatio</a> | <a href="/search">Haku</a>
          </nav>
        </header>
        <Router history={this.props.history}>
          <Route data={this.props.data} path="/eli/sd" component={StatuteList} />
          <Route data={this.props.data} path="/eli/sd/:year" component={StatuteList} />
          <Route data={this.props.data} path="/eli/sd/*" component={Statute} />
          <Route data={this.props.data} path="/search" component={Statute} />
        </Router>
      </div>
    );
  }
}
