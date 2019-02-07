import React, { Component } from 'react';
import AudioAnalyser from './components/audio-analyzer/audio-analyzer';
import logo from './logo.svg';
import { connect } from 'react-redux'
import { State } from './redux/reducers'
import { getMediaStream } from './redux/selectors'
import { setMediaStream } from './redux/actions/media'
import './App.css';


interface Props {
  handleSubmit: (value: string) => void
  mediaStream: any;
}
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
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  // public async componentDidMount() {
    // this.setAudioLocalStore()
  // }

  private async setAudioLocalStore() {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    this.setState({audio},() => {
      this._handleSubmit();
    });
  }

  private async getMicrophone() {
    if(this.props.mediaStream) {
      // this.setAudioLocalStore();
      //check that media stream is in redux
      let currentMediaObj = this.props.mediaStream;
      currentMediaObj.getTracks().forEach((track: any) => {
        track.enabled = true;
      });
      // currentTrack.enabled = true
      this.setState({ audio: currentMediaObj },() => {
        this._handleSubmit();
      });
    }
    else {
      this.setAudioLocalStore();
    }    
    
  }

  private stopMicrophone() {
    this.state.audio.getTracks().forEach((track: any) => {
      track.enabled = false;
    });
    this._handleSubmit();
    this.setState({ audio: null });
  }

  private toggleMicrophone() {
    if (this.state.audio) {
      this.stopMicrophone();
    } else {
      this.getMicrophone();
    }
  }

  private _handleSubmit() {
    this.props.handleSubmit(this.state.audio)
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


const mapStateToProps = (state: State) => ({
  mediaStream: getMediaStream(state)
})

const mapDispatchToProps = {
  handleSubmit: setMediaStream
}

export default connect<any, any, any>(mapStateToProps as any, mapDispatchToProps)(App)

// export default App;
