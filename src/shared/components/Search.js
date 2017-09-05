import React from 'react';
import { Button, FormControl } from 'react-bootstrap';
import { map, debounce } from 'lodash';
import Promise from 'bluebird';
import Autocomplete from 'react-autocomplete';
import statuteCtrl from '../ctrl/statuteCtrl';
import conceptCtrl from '../ctrl/conceptCtrl';
import SearchResult from './SearchResult';

export default class Search extends React.Component {

  constructor(props) {
    super(props);

    // Debounced so that a query isn't fired for each keystroke
    this._delayedQueryChanged = debounce(this._handleQueryChange.bind(this), 200);

    this.onQueryChange = this.onQueryChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.handleDocCategoryChange = this.handleDocCategoryChange.bind(this);

    this.state = {
      query: '',
      docCategory: 'all',
      autoComplete: [],
      loading: false,
      searchResults: [],
      queryTs: new Date().getTime(),
      acQueryTs: new Date().getTime()
    };
  }

  onQueryChange(event, value) {
    event.persist();
    const ts = new Date().getTime();
    this.setState({
      acQueryTs: ts,
      value,
      loading: true,
      query: value
    });
    this._delayedQueryChanged(event, value, ts);
  }

  onSubmit(event) {
    event.preventDefault();
    return this.query().then((results) => {
      const searchResults = map(results, (result, idx) => {
        return <SearchResult
          key={idx+'-'+new Date().getTime()}
          title={result.title ? result.title.value : ''}
          content={result.txt ? result.txt.value : ''}
          query={this.state.query}
          workUrl={result.s ? result.s.value : ''}
          versionUrl={result.v ? result.v.value : ''}
          statuteVersionUrl={result.st ? result.st.value : ''}
          statuteTitle={result.stt ? result.stt.value : ''}
          type={result.t ? result.t.value : ''}
        >
        </SearchResult>;
      });
      this.setState({searchResults: searchResults});
    }).catch((err) => {
      console.log(err);
    });
  }

  getQueryHandler(docCategory = this.state.docCategory) {
    const handlers = {
      'sd': statuteCtrl.findByQuery,
      'oikeus': 'oikeusHandler'
    };
    return handlers['sd'];
  }

  handleDocCategoryChange(event) {
    this.setState({
      docCategory: event.target.value
    });
  }

  _handleQueryChange(event, value, ts) {
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

  query() {
    const query = this.state.query;
    const ts = new Date().getTime();
    this.setState({queryTs: ts});
    return new Promise((resolve, reject) => {
      if (!query) {
        return this.setState({searchResults: null});
      }
      return this.getQueryHandler()({query: query}).then((results) => {
        if (ts == this.state.queryTs) {
          return resolve(results);
        }
        return reject('Old');
      });
    });
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
      <div className="search">
        <h1>Haku</h1>
        <div className="search-bar">
          <form onSubmit={this.onSubmit}>
            <div className="query-doc-category" style={{display: 'inline-block'}}>
              <FormControl value={this.state.docCategory} onChange={this.handleDocCategoryChange} componentClass="select" placeholder="Valitse">
                <option key={0} value="sd">Lainsäädäntö</option>
                <option key={1} value="oikeus">Oikeuskäytäntö</option>
              </FormControl>
            </div>
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
            <Button type="submit" className="query-button" bsStyle="primary">Hae</Button>
          </form>
        </div>
        <div className="search-results">
          {this.state.searchResults}
        </div>
      </div>
    );
  }

}
