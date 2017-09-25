import React from 'react';
import Promise from 'bluebird';
import { Button, FormControl } from 'react-bootstrap';
import statuteCtrl from '../ctrl/statuteCtrl';
import SearchResultList from './SearchResultList';
import SearchBar from './SearchBar';

export default class Search extends React.Component {

  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);

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

  onSubmit(event) {
    event.preventDefault();
    return this.query().then((results) => {
      this.setState({ results: results });
    }).catch((err) => {
      console.log(err);
    });
  }

  onInputChange(text) {
    this.setState({ query: text });
  }

  getQueryHandler(docCategory = this.state.docCategory) {
    const handlers = {
      'sd': statuteCtrl.findByQuery,
      'oikeus': 'oikeusHandler'
    };
    return handlers['sd'];
  }

  handleDocCategoryChange(category) {
    this.setState({
      docCategory: category
    });
  }

  query() {
    const ts = new Date().getTime();
    this.setState({queryTs: ts});
    return new Promise((resolve, reject) => {
      if (!this.state.query) {
        return;
      }
      return this.getQueryHandler()({query: this.state.query}).then((results) => {
        if (ts == this.state.queryTs) {
          return resolve(results);
        }
        return reject(new Error('Old'));
      });
    });
  }

  render() {
    return (
      <div className="search">
        <h1>Haku</h1>
        <div className="search-bar">
          <form onSubmit={this.onSubmit}>
            <SearchBar onInputChange={this.onInputChange}/>
            <div className="query-doc-category" style={{display: 'inline-block'}}>
              <FormControl value={this.state.docCategory} onChange={this.handleDocCategoryChange} componentClass="select" placeholder="Valitse">
                <option key={0} value="sd">Lainsäädäntö</option>
                <option key={1} value="oikeus">Oikeuskäytäntö</option>
              </FormControl>
            </div>
            <Button type="submit" className="query-button" bsStyle="primary">Hae</Button>
          </form>
        </div>
        <SearchResultList results={this.state.results} query={this.state.query} />
      </div>
    );
  }

}
