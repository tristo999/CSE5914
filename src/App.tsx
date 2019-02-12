import React, { Component } from 'react';
// import * as AutoTrigger from './content.js'
import logo from './logo.svg';
import './App.css';

interface States {
  audio: any;
  blocked: boolean;
}

class App extends React.Component<any,States> {

  constructor(props: any) {
    super(props);
    this.state = {
      audio: null,
      blocked: false
      
    };
    
    this.toggleMicrophone = this.toggleMicrophone.bind(this);
  }

  public componentDidMount() {
    var a = null;
      a = navigator.mediaDevices.getUserMedia({audio: true}).catch(()=> {
        
        this.setState({
          blocked: true
        });
        // do something
    });
     
      
      
    
    // AutoTrigger.autoTrigger();
  }

  private async getMicrophone() {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    console.log("2");
    console.log(audio);
    this.setState({ audio });
  }

  private stopMicrophone() {
    this.state.audio.getTracks().forEach((track: any) => track.stop());
    this.setState({ audio: null });
  }

  private toggleMicrophone() {
    if (this.state.audio) {
      this.stopMicrophone();
    } else {
    
      this.getMicrophone();
    }
  }

  render() {
    return (
      <div className="App">

        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
        
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <button disabled={this.state.blocked} onClick={this.toggleMicrophone}>
              {this.state.audio ? 'Stop microphone' : 'Get microphone input'}
        </button>
      </div>
    );
  }
}

export default App;
