import React, { Component } from 'react';
import AudioAnalyser from './components/audio-analyzer/audio-analyzer';
import logo from './logo.svg';
import './App.css';

interface States {
  audio: any
}

class App extends React.Component<any,States> {

  constructor(props: any) {
    super(props);
    this.state = {
      audio: null
    }
    this.toggleMicrophone = this.toggleMicrophone.bind(this);
  }

  public async componentDidMount() {
    // this.setAudioGlobalStore()
  }

  private async setAudioGlobalStore() {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    this.setState({audio});
    // console.log(audio);
    // console.log(JSON.stringify(audio))
    // localStorage.setItem("audioRecorder", JSON.stringify(audio));
  }

  private async getMicrophone() {
    // if(localStorage.getItem("audioRecoder") != null && JSON.parse(localStorage.getItem("audioRecoder")!).length > 0) {
    //   let currentMediaObj = JSON.parse(localStorage.getItem("audioRecoder")!);
    //   let newMediaStreamObj = currentMediaObj.clone();
    //   this.setState({ audio: newMediaStreamObj });
    // }
    // else {
    //   this.setAudioGlobalStore();
    //   this.setState({ audio: JSON.parse(localStorage.getItem("audioRecoder")!) });
    // }    
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    this.setState({audio});
  }

  private stopMicrophone() {
    this.state.audio.getTracks().forEach((track: any) => {
      console.log(track);
      track.stop();
    });
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
          <p>Testing the text input</p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <button onClick={this.toggleMicrophone}>
              {this.state.audio ? 'Stop microphone' : 'Get microphone input'}
        </button>
        {this.state.audio ? <AudioAnalyser audio={this.state.audio} /> : ''}
      </div>
    );
  }
}

export default App;
