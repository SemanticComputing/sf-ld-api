import React from 'react';
import { shallow, mount, render } from 'enzyme';

import Promise from 'bluebird';
import Search from '../../shared/components/Search';
import SearchResult from '../../shared/components/SearchResult';

import { rikosSearchResult } from '../fixtures';

import Autocomplete from 'react-autocomplete';

jest.mock('../../shared/ctrl/conceptCtrl');
jest.mock('../../shared/ctrl/statuteCtrl');

import conceptCtrl from '../../shared/ctrl/conceptCtrl';
import statuteCtrl from '../../shared/ctrl/statuteCtrl';

describe('<Search />', () => {
  beforeAll(() => {
    conceptCtrl.find.mockImplementation(() => new Promise(() => {}));
    statuteCtrl.findByQuery.mockImplementation(() => new Promise((resolve) => resolve(rikosSearchResult)));
  });
  afterEach(() => {
    conceptCtrl.find.mockClear();
    statuteCtrl.findByQuery.mockClear();
  });

  it('renders a <Autocomplete /> component', () => {
    const wrapper = shallow(<Search />);
    expect(wrapper.find(Autocomplete).length).toBe(1);
  });

  it('renders a submit button', () => {
    const wrapper = shallow(<Search />);
    expect(wrapper.find('Button').length).toBe(1);
  });

  it('calls statuteCtrl.findByQuery at form submit if search terms are given', () => {
    const wrapper = shallow(<Search />);
    wrapper.setState({ query: 'rikos' });
    wrapper.find('form').simulate('submit', { preventDefault: () => undefined });
    expect(statuteCtrl.findByQuery).toHaveBeenCalledWith({query: 'rikos'});
  });

  it('does not call statuteCtrl.findByQuery at form submit if no search terms are given', () => {
    const wrapper = shallow(<Search />);
    wrapper.find('form').simulate('submit', { preventDefault: () => undefined });
    expect(statuteCtrl.findByQuery).not.toHaveBeenCalled();
  });

  it('renders SearchResult components', () => {
    const wrapper = mount(<Search />);
    wrapper.setState({ query: 'rikos' });
    wrapper.find('form').simulate('submit', { preventDefault: () => undefined });
    expect(statuteCtrl.findByQuery).toHaveBeenCalledWith({query: 'rikos'});
    expect(wrapper.find(SearchResult).length).toBe(3);
  });
});
