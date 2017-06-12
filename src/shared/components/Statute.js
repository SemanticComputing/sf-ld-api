import React                  from 'react';
import _                      from 'lodash';
import LegislationJsonLd      from '../lib/LegislationJsonLd';

export default class Statute extends React.Component {

  render() {
    const statute = JSON.parse(this.props.route.data);
    const html = new LegislationJsonLd().getStatuteContent(statute)
    return (
      <div className="content-view" dangerouslySetInnerHTML={{__html: html}}></div>
    );
  }

}
