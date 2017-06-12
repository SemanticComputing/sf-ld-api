import React                   from 'react';
import { Router, Route }       from 'react-router';
import Search                  from './components/Search';
import StatuteList             from './components/StatuteList';
import Statute                 from './components/Statute';

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
        <div className="container">
          <Router history={this.props.history}>
            <Route data={this.props.data} path="/haku*" component={Search} />
            <Route data={this.props.data} path="/search*" component={Search} />
            <Route data={this.props.data} path="/eli/sd/:year" component={StatuteList} />
            <Route data={this.props.data} path="/eli/sd/*" component={Statute} />
            <Route data={this.props.data} path="/eli/sd*" component={StatuteList} />
          </Router>
        </div>
      </div>
    );
  }
}
