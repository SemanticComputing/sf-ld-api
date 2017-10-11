import React from 'react';
import { Link } from 'react-router';
import { object } from 'prop-types';
import prefix from '../lib/prefix';
import CaseLawJsonLd from '../lib/CaseLawJsonLd';

export default function JudgmentListItem(props) {
  return (
    <li className="statute-list-item">
      <Link to={prefix.lengthen(props.judgment['@id'])}>{props.judgment.identifier} - {new CaseLawJsonLd().getJudgmentTitle(props.judgment)}</Link>
    </li>
  );
}

JudgmentListItem.propTypes = {
  judgment: object
};
