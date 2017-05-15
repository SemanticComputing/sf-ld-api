import React                  from 'react';
import { Link }               from 'react-router'
import _                      from 'lodash';
import { connect }            from 'react-redux';
import prefix                 from '../lib/prefix'

@connect(state => ({ data: state.data }))

export default class StatuteList extends React.Component {

  render() {
    const data = JSON.parse(this.props.data);
    //console.log(data);
    const statuteList = _.map(data['@graph'], (statute, i) => {
      const id = statute.idLocal
      var title = '';
      if (statute.hasMember && statute.hasMember[0] && statute.hasMember[0].isRealizedBy && statute.hasMember[0].isRealizedBy[0]) {
        console.log(statute.hasMember[0].isRealizedBy[0].title_fi);
        title = (statute.hasMember[0].isRealizedBy[0].title_fi) ? statute.hasMember[0].isRealizedBy[0].title_fi[0] : statute.hasMember[0].isRealizedBy[0].title_sv[0];
      }
      return <li className="statute-list-item" key={i}><Link to={prefix.lengthen(statute['@id'])}>{statute.idLocal} - {title}</Link></li>
    })
    return (
      <ul className="statute-list" >{statuteList}</ul>
    )
  }

}
