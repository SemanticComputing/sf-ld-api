import React                  from 'react';
import { connect }            from 'react-redux';

@connect(state => ({ data: state.data }))

export default class StatuteList extends React.Component {

  render() {
    return (
      <div className="statute-list">statute list</div>
    )
  }

}
