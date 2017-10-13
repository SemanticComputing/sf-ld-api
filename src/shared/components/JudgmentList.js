import { object } from 'prop-types';
import React from 'react';
import ReactPaginate from 'react-paginate';
import _ from 'lodash';
import JudgmentListItem from './JudgmentListItem';

export default class JudgmentList extends React.Component {

  constructor(props) {
    super(props);

    const data = JSON.parse(props.route.data)['@graph'];

    this.handlePageChange = this.handlePageChange.bind(this);

    this.state = {
      data: data,
      year: (this.props.params.year) ? this.props.params.year.replace(/[^0-9]+/g, '') : undefined,
      pageCount: Math.ceil(data.length / 10),
      pageSize: 10,
      judgmentList: this.getJudgmentList(data, 0, 10)
    };
  }

  handlePageChange(data) {
    this.setState({
      judgmentList: this.getJudgmentList(this.state.data, data.selected, this.state.pageSize)
    });
  }

  getJudgmentList(data, page, pageSize) {
    const offset = page * pageSize;
    return _.map(data.slice(offset, offset + pageSize), (judgment, i) => {
      return <JudgmentListItem judgment={judgment} key={i} />;
    });
  }

  render() {
    return (
      <div className="statutes">
      <h1>{(this.state.year) ? 'Oikeuden ratkaisut (' + this.state.year + ')' : 'Oikeuden ratkaisut'}</h1>
      <ul className="statute-list" >{this.state.judgmentList}</ul>
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

JudgmentList.propTypes = {
  // From React Router
  params: object,
  route: object
};
