import React from 'react';
import { map } from 'lodash';
import SearchResult from './SearchResult';
import { string, array } from 'prop-types';

export default function SearchResulList(props) {

  function renderResults(results, query) {
    return map(results, (result, idx) => {
      return <SearchResult
        key={idx + '-' + new Date().getTime()}
        title={result.title ? result.title.value : ''}
        content={result.txt ? result.txt.value : ''}
        query={query}
        workUrl={result.s ? result.s.value : ''}
        versionUrl={result.v ? result.v.value : ''}
        statuteVersionUrl={result.st ? result.st.value : ''}
        statuteTitle={result.stt ? result.stt.value : ''}
        type={result.t ? result.t.value : ''}
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

SearchResulList.propTypes = {
  results: array,
  query: string
};
