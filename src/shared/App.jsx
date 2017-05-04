import React                   from 'react';
import { Router, Route }       from 'react-router';
import StatuteList             from './components/StatuteList.jsx';
import Statute                 from './components/Statute.jsx';

export default class App extends React.Component {
  render() {
    return (
      <div className="app">
        <header>
          <h2>Semanttinen Finlex</h2>
          <nav>
            <a href="/">Dokumentaatio</a> | <a href="/haku">Haku</a>
          </nav>
        </header>
        <Router history={this.props.history}>
          <Route data={this.props.data} path="/eli/sd" component={StatuteList} />
          <Route data={this.props.data} path="/eli/sd/:year" component={StatuteList} />
          <Route data={this.props.data} path="/eli/sd/*" component={Statute} />
        </Router>
      </div>
    );
  }
}
