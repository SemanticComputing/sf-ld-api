import React from 'react';
import { shallow } from 'enzyme';

import SearchResultList from '../../shared/components/SearchResultList';
import SearchResult from '../../shared/components/SearchResult';
import { rikosSearchResult } from '../fixtures';

describe('<SearchResultList />', () => {
  it('renders <SearchResult /> components based on the given results', () => {
    const wrapper = shallow(<SearchResultList results={rikosSearchResult} query="rikos" />);
    expect(wrapper.find(SearchResult).length).toBe(3);
    expect(wrapper).toMatchSnapshot();
  });
});
