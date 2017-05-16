import React                  from 'react';
import { connect }            from 'react-redux';
import _                      from 'lodash';

//@connect(state => ({ data: state.data }))

export default class Statute extends React.Component {

  render() {
    console.log(typeof this.props.data)
    const data = JSON.parse(this.props.data);
    const version = _.filter(data.hasMember, (item) => {return item.isRealizedBy});
    var html = '';
    if (version[0]) {
      //html += version[0].versionDate
      const lang = version[0].isRealizedBy['@id'].match(/fin$/) ? '_fi' : '_sv';
      html += version[0].isRealizedBy.isEmbodiedBy['content'+lang];
    }
    return (
      <div className="statute-view" dangerouslySetInnerHTML={{__html: html}}></div>
    )
  }

}
