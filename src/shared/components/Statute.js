import React                  from 'react';
import LegislationJsonLd      from '../lib/LegislationJsonLd';

export default class Statute extends React.Component {

  render() {
    const statute = typeof this.props.route.data === 'object' ? this.props.route.data : JSON.parse(this.props.route.data);
    const html = new LegislationJsonLd().getStatuteContent(statute);
    return (
      <div className="content-view" dangerouslySetInnerHTML={{__html: html}}></div>
    );
  }

}
