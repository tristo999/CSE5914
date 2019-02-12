import React, { Component } from 'react';
import AudioVisualiser from '../audio-visualizer/audio-visualizer';

interface Props {
    audio: any
}

interface States {
    audioData: any
}

export default class AudioAnalyser extends React.Component<Props,States> {

    private audioContext: any;
    private analyser: any;
    private dataArray: any;
    private source: any;
    private rafId: any;

  constructor(props: any) {
    super(props);
    this.state = { audioData: new Uint8Array(0) };
    this.tick = this.tick.bind(this);
  }

  public componentDidMount() {
    this.audioContext = new (window.AudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.source = this.audioContext.createMediaStreamSource(this.props.audio);
    this.source.connect(this.analyser);
    this.rafId = requestAnimationFrame(this.tick);
  }

  public componentWillUnmount() {
    cancelAnimationFrame(this.rafId);
    this.analyser.disconnect();
    this.source.disconnect();
  }

  private tick() {
    this.analyser.getByteTimeDomainData(this.dataArray);
    this.setState({ audioData: this.dataArray });
    this.rafId = requestAnimationFrame(this.tick);
  }

  render() {
    return (
        <AudioVisualiser audioData={this.state.audioData} />
    );
  }
}
