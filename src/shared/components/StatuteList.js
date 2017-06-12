import React                  from 'react';
import { Link }               from 'react-router';
import _                      from 'lodash';
import prefix                 from '../lib/prefix';
import LegislationJsonLd      from '../lib/LegislationJsonLd';


export default class StatuteList extends React.Component {

  render() {
    const data = JSON.parse(this.props.route.data);
    //const data = [];
    const year = (this.props.params.year) ? this.props.params.year.replace(/[^0-9]+/g, '') : undefined;
    const statuteList = _.map(data['@graph'], (statute, i) => {
      return (
        <li className="statute-list-item" key={i}>
          <Link to={prefix.lengthen(statute['@id'])}>{statute.idLocal} - {new LegislationJsonLd().getStatuteTitle(statute)}</Link>
        </li>
      );
    });
    return (
      <div className="statutes">
        <h1>{(year) ? "Säädökset ("+year+")" : "Säädökset"}</h1>
        <ul className="statute-list" >{statuteList}</ul>
      </div>
    );
  }

}
