import React                   from 'react';
import { Router, Route }       from 'react-router';
import StatuteList             from './components/StatuteList';

export default class App extends React.Component {
  render() {
    console.log(this.props)
    return (
      <div class="app">
        <h2>Semanttinen Finlex</h2>
        <Router history={this.props.history}>
          <Route path="/eli/sd.html" component={StatuteList} />
        </Router>
      </div>
    );
  }
}
