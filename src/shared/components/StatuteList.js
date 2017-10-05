import { object } from 'prop-types';
import React from 'react';
import ReactPaginate from 'react-paginate';
import _ from 'lodash';
import StatuteListItem from './StatuteListItem';

export default class StatuteList extends React.Component {

  constructor(props) {
    super(props);

    const data = JSON.parse(props.route.data)['@graph'];

    this.handlePageChange = this.handlePageChange.bind(this);

    this.state = {
      data: data,
      year: (this.props.params.year) ? this.props.params.year.replace(/[^0-9]+/g, '') : undefined,
      pageCount: Math.ceil(data.length / 10),
      pageSize: 10,
      statuteList: this.getStatuteList(data, 0, 10)
    };
  }

  handlePageChange(data) {
    this.setState({
      statuteList: this.getStatuteList(this.state.data, data.selected, this.state.pageSize)
    });
  }

  getStatuteList(data, page, pageSize) {
    const offset = page * pageSize;
    return _.map(data.slice(offset, offset + pageSize), (statute, i) => {
      return <StatuteListItem statute={statute} key={i} />;
    });
  }

  render() {
    return (
      <div className="statutes">
      <h1>{(this.state.year) ? 'Säädökset (' + this.state.year + ')' : 'Säädökset'}</h1>
      <ul className="statute-list" >{this.state.statuteList}</ul>
      <ReactPaginate
        id="react-paginate"
        pageCount={this.state.pageCount}
        pageRangeDisplayed={5}
        marginPagesDisplayed={2}
        onPageChange={this.handlePageChange}
        initialPage={0}
        previousLabel={'Edellinen'}
        nextLabel={'Seuraava'}
        breakLabel={<a href=''>...</a>}
        breakClassName={'break-me'}
        containerClassName={'pagination'}
        subContainerClassName={'pages pagination'}
        activeClassName={'active'} />
      </div>
    );
  }
}

StatuteList.propTypes = {
  // From React Router
  params: object,
  route: object
};
