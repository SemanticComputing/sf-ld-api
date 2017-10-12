import React from 'react';
import { map } from 'lodash';
import SearchResult from './SearchResult';
import { string, array } from 'prop-types';

export default function SearchResultList(props) {

  function renderResults(results, query) {
    return map(results, (result, idx) => {
      let title;
      if (!result.title || (result.title && result.statuteTitle && result.title.value === result.statuteTitle.value))
        title = '';
      else
        title = result.title;
      return <SearchResult
        key={idx + '-' + new Date().getTime()}
        title={title}
        content={result.content ? result.content.value : ''}
        query={query}
        workUrl={result.statute ? result.statute.value : ''}
        versionUrl={result.statuteVersion ? result.statuteVersion.value : ''}
        statuteVersionUrl={result.lawVersion ? result.lawVersion.value : ''}
        statuteTitle={result.statuteTitle ? result.statuteTitle.value : ''}
        type={result.statuteType ? result.statuteType.value : ''}
      >
      </SearchResult>;
    });
  }

  return (
    <div className="search-results">
      {renderResults(props.results, props.query)}
    </div>
  );
}

SearchResultList.propTypes = {
  results: array,
  query: string
};
