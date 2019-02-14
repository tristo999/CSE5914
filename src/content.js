/* src/content.js */
/*global chrome*/
import AudioAnalyser from './components/audio-analyzer/audio-analyzer';
import React from 'react';
import ReactDOM from 'react-dom';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import "./content.css";

// WebAudioRecorder code based on https://github.com/addpipe/simple-web-audio-recorder-demo

class ExtensionBase extends React.Component{
    
    URL = window.URL || window.webkitURL;

   constructor(props) {
      super(props);
      this.state = {
        audio: null, 
        recorder: null,
        audioContext: null,
        iFrameDoc: null,
        speechToTextObj: null,
        test: null,
        watsonSessionId: null,
        watsonAssistantResponse: "",
        errorText: "",
        playlistLink: ""
      };
      this.list = React.createRef();
      this.toggleMicrophone = this.toggleMicrophone.bind(this);
      this.startRecording = this.startRecording.bind(this);
      this.stopRecording = this.stopRecording.bind(this);
      this.createDownloadLink = this.createDownloadLink.bind(this);
      this.createPlaylist = this.createPlaylist.bind(this);      
      this.speechToTextConversion = this.speechToTextConversion.bind(this);
      this.triggerSpotifyAuth = this.triggerSpotifyAuth.bind(this);
      localStorage.setItem('spotifyAccessToken', null);
    }

  async setAudioGlobalStore() {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    this.setState({audio});
  }

  async startRecording() {

    console.log("startRecording() called");      
    var constraints = { audio: true, video:false }
    let AudioContext = window.AudioContext || window.webkitAudioContext;
  
    await navigator.mediaDevices.getUserMedia(constraints).then((stream)=> {
      console.log("getUserMedia() success, stream created, initializing WebAudioRecorder...");

      let audioContext = new AudioContext();
      let input = audioContext.createMediaStreamSource(stream);
      let encodingType = 'wav';
  
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
          mp3: {bitRate: 160},
          wav: {bitRate: 160}
        });
  
      //start the recording process
      recorder.startRecording();

      this.setState({audio: stream, recorder, errorText: ""})
  
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
    
    let currentRecorder = this.state.recorder;
    currentRecorder.finishRecording();
    this.setState({recorder: currentRecorder});
    this.stopMicrophone();  
  }
  stopMicrophone() {
    this.state.audio.getTracks().forEach((track) => track.stop());
    this.setState({ audio: null });
  }
  toggleMicrophone(iFrameDoc) {
    if (this.state.audio) {
      this.stopRecording()
    } else {
      this.startRecording();
    }
    this.setState({iFrameDoc})
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

    this.state.iFrameDoc.getElementById("recordingsList").innerHTML = li.innerHTML;

    this.speechToTextConversion(blob);
  }

  // WATSON FLOW
  async speechToTextConversion(blob) {
    await fetch("https://stream.watsonplatform.net/speech-to-text/api/v1/recognize", {
      method: "POST",
      headers: {
        "Authorization": "Basic YXBpa2V5OllROWhFV1k4T1lJeU82N0dLcVo1dU94TzFnZHZ3WTQ2cXk4dzBJbnVqZWlv",
        "Content-Type": "audio/wav"
      },
      body: blob
    }).then((response) => {
        response.json().then((obj) => {
          this.setState({speechToTextObj: obj}, () => {
            this.sendDataToWatsonAssistant()
          })
        });
    }).catch((error) => {
        console.log(error)
    });  
  }

  async sendDataToWatsonAssistant() {
    let analyzedSoundObject = this.state.speechToTextObj;
    console.log(analyzedSoundObject);
    if(analyzedSoundObject.results.length < 1) {
      this.setState({errorText: "Unrecognized voice input, please try again"})
      return;
    }
    let userSpokenText = analyzedSoundObject.results[0].alternatives[0].transcript
    let curSessionId = this.state.watsonSessionId;

    await fetch("https://gateway.watsonplatform.net/assistant/api/v2/assistants/dbdb7d30-0fb5-4b86-8290-22a90b7b467b/sessions?version=2019-02-02", {
      method: "POST",
      headers: {
        "Authorization": "Basic YXBpa2V5Ok42YVZnYndjMkhTanNFb0x0am9HQlZxaGVSXzMwSnhkbl9qUXc2bnotVUNX",
      },
    }).then((response) => {
      response.json().then(async (obj) => {
        console.log(obj);
        await this.setState({watsonSessionId: obj.session_id}, ()=>{
          curSessionId = obj.session_id;
        });
      });
    }).catch((error) => {
        console.log(error)
    });

    let data = {input: {text: userSpokenText}}

    await fetch(`https://gateway.watsonplatform.net/assistant/api/v2/assistants/dbdb7d30-0fb5-4b86-8290-22a90b7b467b/sessions/${curSessionId}/message?version=2019-02-02`, {
      method: "POST",
      headers: {
        "Authorization": "Basic YXBpa2V5Ok42YVZnYndjMkhTanNFb0x0am9HQlZxaGVSXzMwSnhkbl9qUXc2bnotVUNX",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then((response) => {
      response.json().then((obj) => {
        console.log(obj);
        this.analyzeAssistantResponse(obj);
      });
    }).catch((error) => {
        console.log(error)
    });
  }

  analyzeAssistantResponse(assistantResponse) {
    let currentIntent = ""
    assistantResponse = assistantResponse.output
    if (assistantResponse.actions)
    {
      // analyzing actions
      if (assistantResponse.actions[0].name === "make_playlist") {
        var j;
        var artist_name = "Undefined";
        for (j = 0; j < assistantResponse.entities.length; j ++)
        {
          if (assistantResponse.entities[j].entity === "artist")
          {
            artist_name = assistantResponse.entities[j].value
            this.createPlaylist(artist_name);
          }
        }
      }
    }

    if (assistantResponse.intents.length > 0) {
      currentIntent = assistantResponse.intents[0].intent;
      //console.log('Detected intent: #' + currentIntent);
    }
    if (assistantResponse.generic.length > 0) {
      this.setState({watsonAssistantResponse: assistantResponse.generic[0].text})
      // currentIntent = response.output.intents[0].intent;
      //console.log('Detected intent: #' + currentIntent);
    }
  }

  // SPOTIFY FLOW  
  
  triggerSpotifyAuth() {
    var event = document.createEvent('Event');
    event.initEvent('hello');
    document.dispatchEvent(event);
    console.log("Opening AUTH");
  }

  createPlaylist(name) {
      var token = localStorage.getItem("spotifyAccessToken");
      if (token) {
          var s = new window.SpotifyWebApi();
          s.setAccessToken(token);
          s.getMe().then((value) => {
              var userID = value.id;
              console.log(userID);
              var playlistBody = { "name": name };
              s.createPlaylist(userID, playlistBody).then((playlistData) => {
                  console.log(playlistData);
                  var playlistID = playlistData.id;
                  this.addSongsArtist(name, 10, playlistID);
                  this.setState({playlistLink : playlistData.external_urls.spotify});
              });
          });
      } else {

      }
  }

  addSongsArtist(name, numberOfSongs, playlistID) {
    var token = localStorage.getItem("spotifyAccessToken");
    var s = new window.SpotifyWebApi();
    s.setAccessToken(token);
    var query = "artist:" + name;
    var searchType = ["track"];
    var searchBody = { "limit": numberOfSongs.toString() };
    s.search(query, searchType, searchBody).then((results) => {
        console.log(results);
        var songArray = [];
        for (var i = 0; i < 9; i++) {
            songArray[i] = results.tracks.items[i].uri;
        }
        s.addTracksToPlaylist(playlistID, songArray);
    });
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
                        <h1>Music Buddy v0.0.1</h1>
                        <button className="record-button" onClick={()=>this.toggleMicrophone(document)}>
                              {this.state.audio ? 'Stop recording' : 'Start Recording'}
                        </button>
                        <button className="login-button" onClick={this.triggerSpotifyAuth}>
                            {this.state.test ? 'Spotify Errored Out' : 'Login With Spotify'}
                        </button>
                        {this.state.audio ? <AudioAnalyser audio={this.state.audio} /> : ''}
                        <div id="recordingsList"></div>
                        <p>{this.state.watsonAssistantResponse}</p>
                        <p>{this.state.playlistLink}</p>
                        <p style={{color: "red"}}>{this.state.errorText}</p>
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
        console.log("displayed");
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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'access_token') {
        localStorage.setItem("spotifyAccessToken", msg.token);
    }
});

document.body.appendChild(app);
ReactDOM.render(<ExtensionBase />, app);
document.addEventListener("hello", function (data) {
    chrome.runtime.sendMessage("test");

});





// wait for the store to connect to the background page
// store.ready().then(() => {
//   // The store implements the same interface as Redux's store
//   // so you can use tools like `react-redux` no problem!
//   ReactDOM.render(
//       <ExtensionBase />
//     ,app);
// });

