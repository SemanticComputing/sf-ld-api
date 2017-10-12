import React from 'react';
import { Link } from 'react-router';
import { object } from 'prop-types';
import prefix from '../lib/prefix';
import LegislationJsonLd from '../lib/LegislationJsonLd';
import eli from '../lib/eli';

export default function StatuteListItem(props) {
  return (
    <li className="statute-list-item">
      <Link to={prefix.lengthen(props.statute['@id'])}>{eli.getStatuteLocalId(props.statute['@id'])} {eli.getSectionOfALawLocalId(props.statute['@id'])} - {new LegislationJsonLd().getStatuteTitle(props.statute)}</Link>
    </li>
  );
}

StatuteListItem.propTypes = {
  statute: object
};
