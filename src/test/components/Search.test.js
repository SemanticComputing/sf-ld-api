import React from 'react';
import { shallow, mount, render } from 'enzyme';

import Promise from 'bluebird';
import Search from '../../shared/components/Search';
import SearchBar from '../../shared/components/SearchBar';
import SearchResultList from '../../shared/components/SearchResultList';

import { rikosSearchResult } from '../fixtures';

jest.mock('../../shared/lib/textSearch');

import textSearch from '../../shared/lib/textSearch';

describe('<Search />', () => {
  beforeAll(() => {
    textSearch.search.mockImplementation(() => new Promise((resolve) => resolve(rikosSearchResult)));
  });
  afterEach(() => {
    textSearch.search.mockClear();
  });

  it('renders a <SearchBar /> component', () => {
    const wrapper = shallow(<Search />);
    expect(wrapper.find(SearchBar).length).toBe(1);
  });

  it('renders a <SearchResultList /> component', () => {
    const wrapper = shallow(<Search />);
    expect(wrapper.find(SearchResultList).length).toBe(1);
  });

  it('renders a submit button', () => {
    const wrapper = shallow(<Search />);
    expect(wrapper.find('Button').length).toBe(1);
  });

  it('calls statuteCtrl.findByQuery at form submit if search terms are given', () => {
    const wrapper = shallow(<Search />);
    wrapper.setState({ query: 'rikos', docCategory: 'sd' });
    wrapper.find('form').simulate('submit', { preventDefault: () => undefined });
    expect(textSearch.search).toHaveBeenCalledWith('sd', 'rikos');
  });

  it('does not call statuteCtrl.findByQuery at form submit if no search terms are given', () => {
    const wrapper = shallow(<Search />);
    wrapper.find('form').simulate('submit', { preventDefault: () => undefined });
    expect(textSearch.search).not.toHaveBeenCalled();
  });
});
