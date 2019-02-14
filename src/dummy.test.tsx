import React from 'react';

import App from './dummy';
import {shallow} from 'enzyme';


const wrapper = shallow<App>(<App />);

describe('App component', () => {
  it('should be add correctly', () => {
    
    expect(wrapper.instance().add(3,4)).toEqual(7);
  });
});