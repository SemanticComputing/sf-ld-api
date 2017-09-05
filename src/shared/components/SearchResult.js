import React                                            from 'react';
import { Button, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import _                                                from 'lodash';
import Promise                                          from 'bluebird';
import Autocomplete                                     from 'react-autocomplete';
import $                                                from 'jquery';
import ReactTooltip                                     from 'react-tooltip';
import statuteCtrl                                      from '../ctrl/statuteCtrl';
import conceptCtrl                                      from '../ctrl/conceptCtrl';
import eli                                              from '../lib/eli';
import Sparql                                           from '../lib/Sparql';

export default class SearchResult extends React.Component {

  constructor(props) {
    const showContentTypes = [
      'http://data.finlex.fi/schema/sfl/Section',
      'http://data.finlex.fi/schema/sfl/Subsection'
    ];
    super(props);
    this.sectionId = eli.getSectionOfALawLocalId(props.workUrl);
    this.statuteId = eli.getStatuteLocalId(props.workUrl);
    this.heading = props.title;
    this.content = (_.indexOf(showContentTypes, props.type) > -1) ? this.sanitize(props.content, props.query) : '';
    this.versionUrl = props.versionUrl;
    this.workUrl = props.workUrl;
    this.statuteVersionUrl = props.statuteVersionUrl;
  }

  sanitize(html, query) {
    const $html = $('<div />', {html:html});
    $html.find('.item-identifier').html('');
    $html.find('.reference-amendment').html('');
    $html.find('.heading').html('');
    $html.find('.section-id').html('');
    $html.html($html.html().replace(new RegExp(query,'gi'), '<strong>$&</strong>'));
    return $html.html();
  }

  render() {
    return (
      <div className="search-result">
        <div className="search-result-statute-id"><a href={this.statuteVersionUrl ? this.statuteVersionUrl : this.versionUrl}>{this.statuteId}</a></div>
        <div className="search-result-statute-title"><a href={this.statuteVersionUrl ? this.statuteVersionUrl : this.versionUrl}>{this.props.statuteTitle ? this.props.statuteTitle : ''}</a></div>
        <div className="search-result-title"><a href={this.versionUrl}>{this.sectionId} {this.heading && this.sectionId ? '- '+this.heading : this.heading ? this.heading : ''}</a></div>
        <div className="search-result-text" dangerouslySetInnerHTML={{__html: this.content}}></div>
        <ReactTooltip />
        <hr/>
      </div>
    );
  }

}
