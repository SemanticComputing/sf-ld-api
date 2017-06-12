import React                                            from 'react';
import { Button, ControlLabel, FormControl, FormGroup } from 'react-bootstrap'
import _                                                from 'lodash';
import Promise                                          from 'bluebird';
import Autocomplete                                     from 'react-autocomplete';
import conceptCtrl                                      from '../ctrl/conceptCtrl';

export default class Search extends React.Component {


  constructor(props) {
    super(props);
    const data = this.props.route.data;
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleDocCategoryChange = this.handleDocCategoryChange.bind(this);
    this.state = {
      query: '',
      docCategory: 'all',
      autoComplete: [],
      loading: false
    }
  }


  getQueryHandler(docCategory = this.state.docCategory) {
    const handlers = {
      'all': 'allHandler',
      'sd': 'sdHandler',
      'oikeus': 'oikeusHandler'
    }
    return handler[docCategory];
  }


  handleDocCategoryChange(event) {
    this.setState({
      docCategory: event.target.value
    });
  }


  handleQueryChange(event, value) {
    this.setState({ value, loading: true })
    this.queryAc(value)
      .then((items) => { this.setState({ autoComplete: items, loading: false });})
      .catch((err) => { console.log(err);})
  }


  query() {
    console.log(this.getQueryHandler());
  }


  queryAc(query) {
    return new Promise((resolve, reject) => {
      if (!query) {
        return reject();
      }
      conceptCtrl.find({
          query: query
        })
        .then((items) => { return resolve(items);})
        .catch((err) => { return reject(err);})
    });
  }


  render() {
    return (
      <div className="search">
        <h1>Haku</h1>
        <form>
          <Autocomplete
            className="form-control"
            placeholder="Nimi"
            wrapperProps={{ className: 'query-wrapper' }}
            inputProps={{ id: 'query-autocomplete', placeholder: 'Hakusana(t)', className: 'form-control' }}
            ref="autocomplete"
            value={this.state.value}
            items={this.state.autoComplete}
            getItemValue={(item) => item.sl.value}
            onSelect={(value, item) => {
              this.setState({ value, autoComplete: [ item ] })
            }}
            onChange={this.handleQueryChange}
            renderItem={(item, isHighlighted) => (
              <div
                style={{ background: isHighlighted ? 'lightgray' : 'white' }}
                key={item.id}
                id={item.id}
              >{item.sl.value}</div>
            )}
          />
          <Button className="query-button" bsStyle="primary" onClick={() => this.query()}>Hae</Button>
          <FormGroup controlId="docCategory">
            <ControlLabel>Aineisto</ControlLabel>
            <FormControl value={this.state.docCategory} onChange={this.handleDocCategoryChange} componentClass="select" placeholder="Valitse">
              <option key={0} value="all">Kaikki</option>
              <option key={1} value="sd">Säädökset</option>
              <option key={2} value="oikeus">Oikeuskäytäntö</option>
            </FormControl>
          </FormGroup>
        </form>
      </div>
    )
  }

}
