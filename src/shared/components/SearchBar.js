import React from 'react';
import { map, debounce } from 'lodash';
import Promise from 'bluebird';
import Autocomplete from 'react-autocomplete';
import conceptCtrl from '../ctrl/conceptCtrl';
import { func } from 'prop-types';

export default class SearchBar extends React.Component {

  constructor(props) {
    super(props);

    // Debounced so that a query isn't fired for each keystroke
    this.delayedQueryChanged = debounce(this._handleQueryChange.bind(this), 200);

    this.onQueryChange = this.onQueryChange.bind(this);

    this.state = {
      query: '',
      autoComplete: [],
      loading: false,
      searchResults: [],
      queryTs: new Date().getTime(),
      acQueryTs: new Date().getTime()
    };
  }

  onQueryChange(event, value) {
    const ts = new Date().getTime();
    this.setState({
      acQueryTs: ts,
      value,
      loading: true,
      query: value
    });
    this.delayedQueryChanged(value, ts);
    this.props.onInputChange(value);
  }

  _handleQueryChange(value, ts) {
    return this.queryAc(value)
      .then((items) => {
        const itemsMod = map(items, (item) => {
          item.label = item.sl.value;
          return item;
        });
        if (ts == this.state.acQueryTs)
          this.setState({ autoComplete: itemsMod, loading: false });
      })
      .catch((err) => { console.log(err); });
  }

  // Autocomplete
  queryAc(query) {
    return new Promise((resolve, reject) => {
      if (!query) {
        return resolve([]);
      }
      conceptCtrl.find({
        query: query,
        limit: 10
      })
        .then((items) => { return resolve(items); })
        .catch((err) => { return reject(err); });
    });
  }

  render() {
    return (
      <Autocomplete
        className="form-control"
        placeholder="Nimi"
        wrapperProps={{ className: 'query-wrapper' }}
        inputProps={{ id: 'query-autocomplete', placeholder: 'Hakusana(t)', className: 'form-control' }}
        value={this.state.value}
        items={this.state.autoComplete}
        getItemValue={(item) => item.sl.value}
        onSelect={(value, item) => {
          this.setState({ value, autoComplete: [item], query : item.sl.value });
        }}
        onChange={this.onQueryChange}
        renderItem={(item, isHighlighted) => (
          <div
            style={{ background: isHighlighted ? 'lightgray' : 'white' }}
            key={item.id}
            id={item.id}
          >{item.label}</div>
        )}
      />
    );
  }
}

SearchBar.propTypes = {
  onInputChange: func
};
