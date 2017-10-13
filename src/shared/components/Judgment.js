import React from 'react';
import CaseLawJsonLd from '../lib/CaseLawJsonLd';

export default class Judgment extends React.Component {

  render() {
    const judgment = JSON.parse(this.props.route.data);
    const html = new CaseLawJsonLd().getJudgmentContent(judgment);
    return (
      <div className="content-view" dangerouslySetInnerHTML={{__html: html}}></div>
    );
  }

}
