import React from 'react';
import { object } from 'prop-types';
import prefix from '../lib/prefix';
import LegislationJsonLd from '../lib/LegislationJsonLd';
import eli from '../lib/eli';

export default function StatuteListItem(props) {
  // @TODO: replace a-element with react-router Link
  return (
    <li className="statute-list-item">
      <a href={prefix.lengthen(props.statute['@id'])}>{eli.getStatuteLocalId(props.statute['@id'])} {eli.getSectionOfALawLocalId(props.statute['@id'])} - {new LegislationJsonLd().getStatuteTitle(props.statute)}</a>
    </li>
  );
}

StatuteListItem.propTypes = {
  statute: object
};
