import React from 'react';
import { object } from 'prop-types';
import prefix from '../lib/prefix';
import CaseLawJsonLd from '../lib/CaseLawJsonLd';

export default function JudgmentListItem(props) {
  // @TODO: replace a-element with react-router Link
  const cl = new CaseLawJsonLd();
  return (
    <li className="statute-list-item">
      <a href={prefix.lengthen(props.judgment['@id'])}>{cl.getJudgmentEcliIdentifier(props.judgment)} - {cl.getJudgmentTitle(props.judgment)}</a>
    </li>
  );
}

JudgmentListItem.propTypes = {
  judgment: object
};
