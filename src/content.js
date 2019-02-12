/* src/content.js */
/*global chrome*/
import AudioAnalyser from './components/audio-analyzer/audio-analyzer';
import React from 'react';
import ReactDOM from 'react-dom';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import "./content.css";

class ExtensionBase extends React.Component{
    
    URL = window.URL || window.webkitURL;

   constructor(props) {
      super(props);
      this.state = {
        audio: null, 
        recorder: null,
        audioContext: null
      };
      this.list = React.createRef();
      this.toggleMicrophone = this.toggleMicrophone.bind(this);
      this.startRecording = this.startRecording.bind(this);
      this.stopRecording = this.stopRecording.bind(this);
      this.createDownloadLink = this.createDownloadLink.bind(this);

    }

    componentDidMount() {
      this.list = React.createRef();
    }

   async setAudioGlobalStore() {
      const audio = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      this.setState({audio});
      // localStorage.setItem("audioRecorder", JSON.stringify(audio));
    }

  
   async getMicrophone() {
      const audio = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      // let AudioContext = window.AudioContext || window.webkitAudioContext;
      // let audioContext = new AudioContext();

      // let input = audioContext.createMediaStreamSource(audio);
      // let encodingType = 'wav';

      // let recorder = new window.WebAudioRecorder(input, {
      //   workerDir: "app/webAudioRecorder/", // must end with slash
      //   encoding: encodingType,
      //   numChannels:2, //2 is the default, mp3 encoding supports only 2
      //   onEncoderLoading: function(recorder, encoding) {
      //     // show "loading encoder..." display
      //     console.log("Loading "+encoding+" encoder...");
      //   },
      //   onEncoderLoaded: function(recorder, encoding) {
      //     // hide "loading encoder..." display
      //     console.log(encoding+" encoder loaded");
      //   }
      // });

      // recorder.onComplete = function(recorder, blob) { 
      //   console.log("Encoding complete");
      //   this.createDownloadLink(blob,recorder.encoding);
      // }

      // recorder.setOptions({
      //   timeLimit:120,
      //   encodeAfterRecord:true,
      //     ogg: {quality: 0.5},
      //     mp3: {bitRate: 160}
      // });

      // this.setState({audio, recorder, audioContext});

      // if(localStorage.getItem("audioRecoder") != null && JSON.parse(localStorage.getItem("audioRecoder")).length > 0) {
      //    let currentMediaObj = JSON.parse(localStorage.getItem("audioRecoder"));
      //   let newMediaStreamObj = currentMediaObj.clone();
      //   this.setState({ audio: newMediaStreamObj });
      // }
      // else {
      //   this.setAudioGlobalStore();
      //   this.setState({ audio: JSON.parse(localStorage.getItem("audioRecoder")) });
      // }    

      // context = new AudioContext()

      // var source = context.createMediaStreamSource(stream)

      // var rec = new Recorder(source)
      // rec.record()
      // todo look at this to set it up:
      // https://addpipe.com/blog/using-recorder-js-to-capture-wav-audio-in-your-html5-web-site/
      // let recorder = new WebAudioRecorder(audio, {
      //   workerDir: "javascripts/"     // must end with slash
      // });

      // this.setState({recorder});
    }

  async startRecording() {
    // let currentRecorder = this.state.recorder;
    // currentRecorder.startRecording();
    // this.setState({recorder: currentRecorder});

    console.log("startRecording() called");      
    var constraints = { audio: true, video:false }
    let AudioContext = window.AudioContext || window.webkitAudioContext;
  
    await navigator.mediaDevices.getUserMedia(constraints).then((stream)=> {
      console.log("getUserMedia() success, stream created, initializing WebAudioRecorder...");

      let audioContext = new AudioContext();
      let input = audioContext.createMediaStreamSource(stream);
      let encodingType = 'wav';
  
      //update the format 
      // document.getElementById("formats").innerHTML="Format: 2 channel "+encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value+" @ "+audioContext.sampleRate/1000+"kHz"
  
      //assign to gumStream for later use
      // gumStream = stream;
      
      /* use the stream */
      // input = audioContext.createMediaStreamSource(stream);
      
      //stop the input from playing back through the speakers
      //input.connect(audioContext.destination)
  
      //get the encoding 
      // encodingType = encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value;
      
      //disable the encoding selector
      // encodingTypeSelect.disabled = true;
  
      let recorder = new window.WebAudioRecorder(input, {
        workerDir: "app/webAudioRecorder/", // must end with slash
        encoding: encodingType,
        numChannels:2, //2 is the default, mp3 encoding supports only 2
        onEncoderLoading: function(recorder, encoding) {
          // show "loading encoder..." display
          console.log("Loading "+encoding+" encoder...");
        },
        onEncoderLoaded: function(recorder, encoding) {
          // hide "loading encoder..." display
          console.log(encoding+" encoder loaded");
        }
      });
  
      recorder.onComplete = (recorder, blob) => { 
        console.log("Encoding complete");
        this.createDownloadLink(blob,recorder.encoding);
      }
  
      recorder.setOptions({
        timeLimit:120,
        encodeAfterRecord: true,
          ogg: {quality: 0.5},
          mp3: {bitRate: 160}
        });
  
      //start the recording process
      recorder.startRecording();

      this.setState({recorder})
  
       console.log("Recording started");
  
    }).catch(function(err) {
      console.log(err)
        //enable the record button if getUSerMedia() fails
        // recordButton.disabled = false;
        // stopButton.disabled = true;
  
    });
  
    //disable the record button
      // recordButton.disabled = true;
      // stopButton.disabled = false;
    
  }

  stopRecording() {
    console.log("stopRecording() called");

    //stop microphone access
    // gumStream.getAudioTracks()[0].stop();
  
    //disable the stop button
    // stopButton.disabled = true;
    // recordButton.disabled = false;
    
    //tell the recorder to finish the recording (stop recording + encode the recorded audio)

    let currentRecorder = this.state.recorder;
    currentRecorder.finishRecording();
    this.setState({recorder: currentRecorder});

    // this.state.recorder.finishRecording();
  
  }

  createDownloadLink(blob,encoding) {
	
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');
  
    //add controls to the <audio> element
    au.controls = true;
    au.src = url;
  
    //link the a element to the blob
    link.href = url;
    link.download = new Date().toISOString() + '.'+encoding;
    link.innerHTML = link.download;
  
    //add the new audio and a elements to the li element
    li.appendChild(au);
    li.appendChild(link);
  
    console.log(li)
    // console.log(document.getElementById("recordingsList"))
    // document.getElementById("recordingsList").appendChild(li);
  }
    
   stopMicrophone() {
      this.state.audio.getTracks().forEach((track) => track.stop());
      this.setState({ audio: null });
   }
   toggleMicrophone() {
      if (this.state.audio) {
        this.stopMicrophone();
      } else {
        this.getMicrophone();
      }
    }
  
    render() {
        return (
            <Frame head={[<link type="text/css" rel="stylesheet" href={chrome.runtime.getURL("/static/css/content.css")} ></link>]}> 
              <FrameContextConsumer>
               {
               // Callback is invoked with iframe's window and document instances
                   ({document, window}) => {
                      // Render Children
                      return (
                         <div className={'my-extension'}>
                            <h1>Hello world - My first Extension</h1>

                            <button onClick={this.toggleMicrophone}>
                                 {this.state.audio ? 'Stop microphone' : 'Get microphone input'}
                           </button>
                           {this.state.audio ? <AudioAnalyser audio={this.state.audio} /> : ''}
                           <button onClick={this.startRecording}>
                                 Start recording
                           </button>
                           <button onClick={this.stopRecording}>
                                 End recording
                           </button>
                           <ul id="recordingsList" ref={this.myRef}></ul>
                         </div>
                      )
                   }
                }
               </FrameContextConsumer>
            </Frame>
        )
    }
}

const app = document.createElement('div');
app.id = "my-extension-root";


app.style.display = "none";
chrome.runtime.onMessage.addListener(
   function(request, sender, sendResponse) {
      if( request.message === "clicked_browser_action") {
        toggle();
      }
   }
);
function toggle(){
   if(app.style.display === "none"){
     app.style.display = "block";
   }else{
     app.style.display = "none";
   }
}

document.body.appendChild(app);
ReactDOM.render(<ExtensionBase />, app);

// wait for the store to connect to the background page
// store.ready().then(() => {
//   // The store implements the same interface as Redux's store
//   // so you can use tools like `react-redux` no problem!
//   ReactDOM.render(
//       <ExtensionBase />
//     ,app);
// });
