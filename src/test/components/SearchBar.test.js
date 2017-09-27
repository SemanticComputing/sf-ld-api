import React from 'react';
import { shallow } from 'enzyme';

import Promise from 'bluebird';
import SearchBar from '../../shared/components/SearchBar';

jest.mock('../../shared/ctrl/conceptCtrl');

import conceptCtrl from '../../shared/ctrl/conceptCtrl';

jest.useFakeTimers();

describe('<SearchBar />', () => {
  beforeAll(() => {
    conceptCtrl.find.mockImplementation(() => new Promise(() => {}));
  });
  afterEach(() => {
    conceptCtrl.find.mockClear();
  });

  it('calls props.onInputChange when input changes', () => {
    const onInputChange = jest.fn();
    const wrapper = shallow(<SearchBar onInputChange={onInputChange} />);
    wrapper.find('Autocomplete').simulate('change', {},  'rikos');
    expect(onInputChange).toHaveBeenCalledWith('rikos');
  });

  it('calls conceptCtrl.find on input change if search terms are given', () => {
    const onInputChange = jest.fn();
    const wrapper = shallow(<SearchBar onInputChange={onInputChange} />);

    expect(conceptCtrl.find).not.toHaveBeenCalled();

    wrapper.find('Autocomplete').simulate('change', {},  'rikos');
    jest.runAllTimers();

    expect(conceptCtrl.find).toHaveBeenCalledWith({ query: 'rikos', limit: 10 });
  });

  it('does not call conceptCtrl.find on input change if search terms are empty', () => {
    const onInputChange = jest.fn();
    const wrapper = shallow(<SearchBar onInputChange={onInputChange} />);

    expect(conceptCtrl.find).not.toHaveBeenCalled();

    wrapper.find('Autocomplete').simulate('change', {},  '');
    jest.runAllTimers();

    expect(conceptCtrl.find).not.toHaveBeenCalled();
  });
});
