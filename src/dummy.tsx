
import React, { Component } from 'react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
class App extends React.Component<any> {
    render() {
        return <h1>Hi</h1>
      }


    public add(x:number,y:number){
        var sum = x+y;
        return sum;
      }
}

export default App;