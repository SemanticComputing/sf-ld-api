import React from 'react';
import { Link } from 'react-router';
import { object, number } from 'prop-types';
import prefix from '../lib/prefix';
import LegislationJsonLd from '../lib/LegislationJsonLd';

export default function StatuteListItem(props) {
  return (
    <li className="statute-list-item">
      <Link to={prefix.lengthen(props.statute['@id'])}>{props.statute.idLocal} - {new LegislationJsonLd().getStatuteTitle(props.statute)}</Link>
    </li>
  );
}

StatuteListItem.propTypes = {
  statute: object
};
