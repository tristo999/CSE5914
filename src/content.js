/* src/content.js */
/*global chrome*/
import AudioAnalyser from './components/audio-analyzer/audio-analyzer';
import React from 'react';
import ReactDOM from 'react-dom';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import * as SpotifyHelper from "./util/spotify/spotify-helpers";
import * as WebAudio from "./util/webAudioRecorder/WebAudioRecorder.js"
import "./content.css";

// const WebAudio = require("./util/webAudioRecorder/WebAudioRecorder.js");

// const SpotifyHelper = require("./util/spotify/spotify-helpers");

// WebAudioRecorder code based on https://github.com/addpipe/simple-web-audio-recorder-demo
// https://stackoverflow.com/questions/31211359/refused-to-load-the-script-because-it-violates-the-following-content-sec  ty-po - worker not loading on other tabs

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
        isUserAuthenticated: false,
        watsonAssistantResponse: "",
        errorText: "",
        playlistLink: "",
        inputQuery: "",
        historyToggle: false,
        wavJs: "",
        micDisabled: false,
        showBetaWarning: false,
      };
      this.history = []
      this.list = React.createRef();
      this.toggleMicrophone = this.toggleMicrophone.bind(this);
      this.startRecording = this.startRecording.bind(this);
      this.stopRecording = this.stopRecording.bind(this);
      this.createPlaylist = this.createPlaylist.bind(this);      
      this.speechToTextConversion = this.speechToTextConversion.bind(this);
      this.triggerSpotifyAuth = this.triggerSpotifyAuth.bind(this);
      this.handleInputQueryChange = this.handleInputQueryChange.bind(this);
      this.handleInputQuerySubmit = this.handleInputQuerySubmit.bind(this);
      this.createEmbedLink = this.createEmbedLink.bind(this);
      this.createPlaylist = this.createPlaylist.bind(this);
      this.createPlaylistBridge = this.createPlaylistBridge.bind(this);
      this.makeHistory = this.makeHistory.bind(this);
      this.historyToggle = this.historyToggle.bind(this);
      this.handleMicHover = this.handleMicHover.bind(this);
      this.handleMicUnHover = this.handleMicUnHover.bind(this);

      localStorage.setItem('spotifyAccessToken', null);
    }

    componentDidMount() {
      chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.action === 'access_token') {
            localStorage.setItem("spotifyAccessToken", msg.token);
            this.setState({isUserAuthenticated: true})
        }
      })

      let script = chrome.extension.getURL('/app/webAudioRecorder/WebAudioRecorderWav.min.js');
      this.setWavScript(script)
    }

    componentDidUpdate() {
      if(localStorage.getItem('spotifyAccessToken') !== "null" && !this.state.isUserAuthenticated) {
        console.log(localStorage.getItem('spotifyAccessToken'))
        this.setState({isUserAuthenticated: true});
      }
    }

    setWavScript(script)
    {
      var xhr = new XMLHttpRequest();
      xhr.open("GET",script)
      xhr.onreadystatechange = () => {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          this.setState({wavJs: xhr.responseText});
        }
      };
      xhr.send();
    }

    handleInputQueryChange(e) {
      this.setState({inputQuery: e.target.value});
    }

    handleInputQuerySubmit(e) {
      e.preventDefault();
      let inputText = this.state.inputQuery.toLocaleLowerCase();
      console.log(this.state.inputQuery)
      this.setState({errorText: "", watsonAssistantResponse: "", inputQuery: "", playlistLink: null, speechToTextObj: null } ,() => {
        this.sendDataToWatsonAssistant(inputText);
      })
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

      console.log(window.WebAudioRecorder)
      let recorder = new window.WebAudioRecorder(input, {
        workerDir: this.state.wavJs, // must end with slash
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
        this.speechToTextConversion(blob);
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

      this.setState({audio: stream, recorder, watsonAssistantResponse:"", errorText: "", playlistLink: null})
  
      console.log("Recording started");
  
    }).catch((err) => {
      console.log(err)
      this.setState({micDisabled: true, errorText: "No micrphone available on this page."})
      console.log("errored out")
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
    this.setState({ audio: null, inputQuery: "" });
  }
  toggleMicrophone(iFrameDoc) {
    if (this.state.audio) {
      this.stopRecording()
    } else {
      this.startRecording();
    }
    this.setState({iFrameDoc})
  }

  handleMicHover() {
    this.setState({showBetaWarning: true})
  }
  handleMicUnHover() {
    this.setState({showBetaWarning: false})
  }

  // WATSON FLOW
  async speechToTextConversion(blob) {
    await fetch("https://stream.watsonplatform.net/speech-to-text/api/v1/recognize", {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Authorization": "Basic YXBpa2V5OllROWhFV1k4T1lJeU82N0dLcVo1dU94TzFnZHZ3WTQ2cXk4dzBJbnVqZWlv",
        "Content-Type": "audio/wav"
      },
      body: blob
    }).then((response) => {
        response.json().then((obj) => {
          this.setState({speechToTextObj: obj}, () => {
            this.sendDataToWatsonAssistant(null)
          })
        });
    }).catch((error) => {
        console.log(error)
    });  
  }

  async sendDataToWatsonAssistant(typedTextInput) {
    let analyzedSoundObject = this.state.speechToTextObj;
    let userInputText = "";
    
    if(analyzedSoundObject){
      if(analyzedSoundObject.results.length >= 1) {
        userInputText = analyzedSoundObject.results[0].alternatives[0].transcript;
      }
    } else if (typedTextInput && typedTextInput.length > 1) {
      userInputText = typedTextInput;
    }
    else {
      this.setState({errorText: "Unrecognized input, please try again"})
      return;
    }
    if(userInputText.length < 1) {
      this.setState({errorText: "Unrecognized input, please try again"})
      return;
    }
    this.history.unshift({watson:false,message:userInputText,link:false});
    let curSessionId = this.state.watsonSessionId;

    await fetch("https://gateway.watsonplatform.net/assistant/api/v2/assistants/dbdb7d30-0fb5-4b86-8290-22a90b7b467b/sessions?version=2019-02-02", {
      method: "POST",
      headers: {
        "Authorization": "Basic YXBpa2V5Ok42YVZnYndjMkhTanNFb0x0am9HQlZxaGVSXzMwSnhkbl9qUXc2bnotVUNX",
      },
    }).then((response) => {
      response.json().then(async (obj) => {
        await this.setState({watsonSessionId: obj.session_id}, ()=>{
          curSessionId = obj.session_id;
        });
      });
    }).catch((error) => {
        console.log(error)
    });

    let data = {input: {text: userInputText}}
    console.log(userInputText)
    console.log(data);
    curSessionId = (curSessionId ? curSessionId : this.state.watsonSessionId)

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
    var talkString = ""
    let currentIntent = ""
    assistantResponse = assistantResponse.output;
    if(!assistantResponse) {
      this.setState({errorText: "Something went wrong. Please try again."})
      return;
    }
    if (assistantResponse.generic.length > 0) {
      this.setState({watsonAssistantResponse: assistantResponse.generic[0].text, errorText:""});
      talkString = assistantResponse.generic[0].text;
      
    }
    if (assistantResponse.actions)
    {
      // analyzing actions
      if (assistantResponse.actions[0].name === "create_playlist") {
        var j;
        var artist_name = "Undefined";
        var track_name = "Undefined";
        var album_name = "Undefined";
        var numSongs = 10;

        for (j = 0; j < assistantResponse.entities.length; j ++)
        {
          if (assistantResponse.entities[j].entity === "artist")
          {
            artist_name = assistantResponse.entities[j].value
            console.log("Artist is: " + artist_name);
          }
          if (assistantResponse.entities[j].entity === "track")
          {
            track_name = assistantResponse.entities[j].value
            console.log("Track is: " + track_name);
          }
          if (assistantResponse.entities[j].entity === "album")
          {
            album_name = assistantResponse.entities[j].value
            console.log("Album is: " + album_name);
          }
          if (assistantResponse.entities[j].entity === "num_tracks")
          {
            numSongs = assistantResponse.entities[j].value
            console.log(numSongs);
          }
        }
        if (artist_name === "Undefined" && album_name === "Undefined") {
          this.setState({watsonAssistantResponse: "Error, Did not recognize an Album or an Artist. Please Try Again", errorText:""});
          talkString = "Error, Did not recognize an Album or an Artist. Please Try Again"
        } else {
        this.createPlaylist(artist_name,track_name,album_name,numSongs);
        }
      } else if (assistantResponse.actions[0].name === "make_bridge_playlist") {
        var artists = {}
        var i = 0;
        for (j = 0; j < assistantResponse.entities.length; j ++)
        {
          if (assistantResponse.entities[j].entity === "artist")
          {
            artists[i] = assistantResponse.entities[j].value
            i++
          }
        }
        this.createPlaylistBridge(artists[0], artists[1])
      } else if (assistantResponse.actions[0].name === "get_bio") {
        var artist = ""
        
        for (j = 0; j < assistantResponse.entities.length; j ++)
        {
          if (assistantResponse.entities[j].entity === "artist")
          {
            artist = assistantResponse.entities[j].value
            
          }
        }
        this.makeBio(artist);
      } else if (assistantResponse.actions[0].name === "play_song") {
        var artist = "Undefined"
        var album = "Undefined"
        var track = "Undefined"
        for (j = 0; j < assistantResponse.entities.length; j ++)
        {
          if (assistantResponse.entities[j].entity === "artist")
          {
            artist = assistantResponse.entities[j].value
          }
          if (assistantResponse.entities[j].entity === "album")
          {
            album = assistantResponse.entities[j].value
          }
          if (assistantResponse.entities[j].entity === "song")
          {
            track = assistantResponse.entities[j].value
          }
        }
        this.getSingleSong(artist,album,track);
      }
    }
    if (assistantResponse.intents.length > 0) {
      currentIntent = assistantResponse.intents[0].intent;
      //console.log('Detected intent: #' + currentIntent);
    }
    this.textToSpeechConversionFetch(talkString);
    this.history.unshift({watson:true,message:talkString,link:false});
  }

  async makeBio(a){
    var names = a.split(" ")
    var titles="";
    for (var i = 0; i<names.length; i++){
      if (i != names.length-1)
        titles += names[i] + "%20";
      else
        titles += names[i]
    }
    await fetch("https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles="+titles, {
    headers:{
      "Access-Control-Allow-Origin": "*"
    }
    }).then((response)=>{
      response.json().then((x)=>{
        let p = x.query.pages;
        let e = "";
        for(var page in p){
          e = p[page].extract;
        }
        if (e == null) {
          e = "No information found. Try another search."
        }
        let s = this.state.watsonAssistantResponse+"\n\n"+e;
        this.setState({watsonAssistantResponse:s});
        this.history.unshift({watson:true,message:e,link:false});
      }); 
    });
  }
  async textToSpeechConversionFetch(textToConvert) {
    let data = {"text": textToConvert};
    await fetch("https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize", {
      method: "POST",
      headers: {
        "Authorization": "Basic YXBpa2V5Olktcmd0aXZra1N2YzdINzVodkRuRDV4VXc5VHVuNmxyUHZ3MUVpMEpMcjBB",
        "Content-Type": "application/json",
        "Accept": "audio/wav"
      },
      body: JSON.stringify(data)
    }).then((response) => {
      
      var reader = response.body.getReader();
      var audioStream = [];
      reader.read().then(function processAudio({ done, value }) {
        if(value) {
          value.forEach((e)=>{
            audioStream.push(e)
          });
        }

        if (done) {
          console.log("Stream encoding complete, starting to speak.");
          var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

          var arrayBuffer = new ArrayBuffer(audioStream.length);
          var bufferView = new Uint8Array(arrayBuffer);
          for (let i = 0; i < audioStream.length; i++) {
            bufferView[i] = audioStream[i];
          }
      
          audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
              var buf = buffer;
              var source = audioCtx.createBufferSource();
              source.buffer = buf;
              source.connect(audioCtx.destination);
              source.start(0);
          });

          return;
        }
        return reader.read().then(processAudio);
      });
    }).catch((error) => {
        console.log("Text to speech is broken")
        console.log(error)
    }); 
  }

  // SPOTIFY FLOW  
  
  triggerSpotifyAuth() {
    var event = document.createEvent('Event');
    event.initEvent('hello');
    document.dispatchEvent(event); 
    console.log("Opening AUTH");
  }

  async createPlaylist(artist, track, album, numSongs) {
      if (numSongs >= 50) {
        this.setState({watsonAssistantResponse : "Please limit number of songs to under 50", errorText:""});
        this.history.unshift({watson:true,message:"Please limit number of songs to under 50",link:false});
      } else {
        var token = localStorage.getItem("spotifyAccessToken");
        if (token) {
            var s = new window.SpotifyWebApi();
            s.setAccessToken(token);
            s.getMe().then((value) => {
                var userID = value.id;
                console.log(userID);
                var playlistBody = {}
                if (artist === "Undefined") {
                  playlistBody = { "name": album.charAt(0).toUpperCase() + album.slice(1)};
                } else {
                  playlistBody = { "name": artist };
                }
                s.createPlaylist(userID, playlistBody).then(async (playlistData) => {
                    console.log("Creating Playlist");
                    console.log(playlistData);
                    var playlistID = playlistData.id;
                    let e = false;
                    await SpotifyHelper.addSongs(artist,track, album, numSongs, playlistID, s).then((ErrorCode) => {
                      if (ErrorCode === "Undefined") 
                      {
                        e = true;
                        this.setState({watsonAssistantResponse: "Error, No Songs Found", errorText:""});
                        this.history.unshift({watson:true,message:"Error, No Songs Found",link:false});
                      }
                    });
                    if (!e){
                      this.setState({playlistLink : playlistData.external_urls.spotify});
                      this.history.unshift({watson:true,message:playlistData.external_urls.spotify,link:true});
                    }
                });
            });
        } else {

        }
      }
  }

  async createPlaylistBridge(source, dest) {
    source = source.charAt(0).toUpperCase() + source.slice(1)
    dest = dest.charAt(0).toUpperCase() + dest.slice(1)
    var token = localStorage.getItem("spotifyAccessToken");
    if (token) {
      var s = new window.SpotifyWebApi();
      s.setAccessToken(token);
      s.getMe().then(async (value) => {
          var userID = value.id;
          console.log(userID);
          var playlistBody = { "name": source + " -> " + dest};
          s.createPlaylist(userID, playlistBody).then(async (playlistData) => {
            console.log("Creating Bridge Playlist");
            var playlistID = playlistData.id;
            var skipList = [];
            var url = new URL("http://frog.playlistmachinery.com:4682/frog/path");
            var params = {src:source, dest:dest, skips:skipList};
            url.search = new URLSearchParams(params);
            await fetch((url), {
              method: "GET",
              headers:{
                "Access-Control-Allow-Origin": "*"
              }
            }).then(async (response) => {
              response.json().then(async (data) => {
                console.log(data);
                if (data.status == 'ok' && data.path.length >= 2) {
                  var msg = 'Found a path from ' + data.path[0].name + ' to ' + data.path[data.path.length -1].name + ' in ' 
                    + data.path.length + ' songs. '  
                    console.log(msg)
                    var songArray = [];
                    for (var i = 0; i < data.path.length; i++) {
                      await s.getTrack(data.path[i].tracks[0].id).then(async (trackData) => {
                        songArray[i] = trackData.uri
                      });
                    }
                    let e = false;
                    await s.addTracksToPlaylist(playlistID, songArray).then(async (ErrorCode) => {
                      if (ErrorCode === "Undefined") 
                      {
                        e = true;
                        this.setState({watsonAssistantResponse: "Error, No Songs Found", errorText:""});
                        this.history.unshift({watson:true,message:"Error, No Songs Found",link:false});
                      }
                    });
                    if (!e){
                      this.setState({playlistLink : playlistData.external_urls.spotify});
                      this.history.unshift({watson:true,message:playlistData.external_urls.spotify,link:true});
                    }
                } else if (data.status == 'ok' && data.path.length == 1) {
                    this.setState({watsonAssistantResponse : "Cannot Bridge Artist to Self"});
                    this.history.unshift({watson:true,message:"Cannot Bridge Artist to Self",link:false});
                } else if (data.status != 'ok') {
                  this.setState({watsonAssistantResponse : "Unable to Bridge Playlist, Try Again"});
                  this.history.unshift({watson:true,message: "Unable to Bridge Playlist, Try Again",link:false});
                }
              });
            });
        });
      });
    }
  }

  async getSingleSong(artist, album, title) {
    if (title != "Undefined") {
      var token = localStorage.getItem("spotifyAccessToken");
      if (token) {
        var s = new window.SpotifyWebApi();
        s.setAccessToken(token);
        s.getMe().then(async (value) => {
            var userID = value.id;
            console.log(userID);
            var started = false;
            var queue = "";
            if (artist != "Undefined") {
            queue += "artist:" +  artist;
              started = true;
            }
            if (title != "Undefined") {
              if (started) {
                queue += " AND ";
              }
              queue += "track:" + title;
              started = true;
            }
            if (album != "Undefined") {
              if (started) {
                queue += " AND ";
              }
            queue += "album:" +  album;
          }
          console.log("Search: " + queue);
          var searchType = ["track"];
          var searchBody = { "limit": 1 };
          await s.search(queue, searchType, searchBody).then(async(results) => {
              console.log(results);
              if(results.tracks.items.length > 0) {
                this.setState({playlistLink : results.tracks.items[0].external_urls.spotify});
                this.history.unshift({watson:true,message:results.tracks.items[0].external_urls.spotify,link:true});
              }
              else {
                this.setState({errorText: `Error, track name: ${title} not recognized.`});
                // this.setState({watsonAssistantResponse: `Error, track name: ${title} not recognized.`, errorText:""});
                // this.history.unshift({watson:true,message:`Error, track name: ${title} not recognized.`,link:false});
              }

          });
        });
      } else {
        // Errors 
      }
    } else {
      this.setState({errorText:"Error, Must have Track Name"});
      // this.setState({watsonAssistantResponse: "Error, Must have Track Name", errorText:""});
      // this.history.unshift({watson:true,message:"Error, Must have Track Name",link:false});
    }
  }
  
  createEmbedLink(playlistLink) {
    var firstSubstring = playlistLink.substring(0,25);
    var secondSubstring = playlistLink.substring(25);
    return firstSubstring + "embed/" + secondSubstring;
  }

  historyToggle(){
    this.setState(prevState => ({historyToggle:!prevState.historyToggle}))
  }

  makeHistory(){
    console.log(this.history)
    return(
      <div>
        <div className={"history-button"} onClick={this.historyToggle}>Show less...</div>
        {this.history.map((h, index) => (
          !h.link ? <div><p className={'watson-response-text '+(h.watson ? 'watson':'user')}>{h.message}</p></div> : <iframe src={this.createEmbedLink(h.message)} 
          width="400" 
          height="80"
          frameBorder={0} 
          allowTransparency={true} 
          allow="encrypted-media"
          style={{marginTop: "15px"}}
          >
  </iframe>
        ))}
      </div>
    );
  }

    render() {
      let spotifyIconContainerStyle = {};
      if(!this.state.isUserAuthenticated) {
        spotifyIconContainerStyle = {marginRight: "125px", marginTop: "5px"};
       
      } else {
        spotifyIconContainerStyle = {marginRight: "10px", marginLeft: "-5px", marginBottom: "-5px"};
        document.getElementById("my-extension-root").setAttribute("style", "height: 250px;");
      }

      return (
        <Frame head={[<link type="text/css" rel="stylesheet" href={chrome.runtime.getURL("/static/css/content.css")} ></link>]}> 
          <FrameContextConsumer>
            {
            // Callback is invoked with iframe's window and document instances
                ({document, window}) => {
                  // Render Children
                  return (
                      <div className={'my-extension'}>
                        <div className={'user-input-container'}>
                          <div className={"spotify-icon-container"} style={spotifyIconContainerStyle}>
                            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="green" fill-rule="evenodd" clip-rule="evenodd">
                              <path d="M19.098 10.638c-3.868-2.297-10.248-2.508-13.941-1.387-.593.18-1.22-.155-1.399-.748-.18-.593.154-1.22.748-1.4 4.239-1.287 11.285-1.038 15.738 1.605.533.317.708 1.005.392 1.538-.316.533-1.005.709-1.538.392zm-.126 3.403c-.272.44-.847.578-1.287.308-3.225-1.982-8.142-2.557-11.958-1.399-.494.15-1.017-.129-1.167-.623-.149-.495.13-1.016.624-1.167 4.358-1.322 9.776-.682 13.48 1.595.44.27.578.847.308 1.286zm-1.469 3.267c-.215.354-.676.465-1.028.249-2.818-1.722-6.365-2.111-10.542-1.157-.402.092-.803-.16-.895-.562-.092-.403.159-.804.562-.896 4.571-1.045 8.492-.595 11.655 1.338.353.215.464.676.248 1.028zm-5.503-17.308c-6.627 0-12 5.373-12 12 0 6.628 5.373 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12z"/>
                            </svg>
                          </div>
                          {!this.state.isUserAuthenticated ?
                              <button className="login-button" onClick={this.triggerSpotifyAuth}>
                                    {this.state.test ? 'Spotify Errored Out' : 'Login With Spotify'}
                              </button>  
                            :
                            <div>
                              <div className={"input-container"}>
                                <form onSubmit={this.handleInputQuerySubmit}>
                                  {this.state.audio ? 
                                      <AudioAnalyser audio={this.state.audio} /> 
                                    :
                                      <input className={"query-input"} 
                                             type="text" 
                                             placeholder={"What Can I Help You With?"} 
                                             value={this.state.inputQuery} 
                                             onChange={this.handleInputQueryChange}
                                             autoFocus
                                      />
                                  }
                                  {/* <input className={"query-input"} type="text" placeholder={"What Can I Help You With?"} value={this.state.inputQuery} onChange={this.handleInputQueryChange}/> */}
                                </form>
                                {!this.state.micDisabled && 
                                <React.Fragment>
                                  {this.state.audio ? 
                                    <span className={"microphone-icon"} onMouseEnter={this.handleMicHover} onMouseLeave={this.handleMicUnHover} onClick={()=>this.toggleMicrophone(document)}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFF"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.2-9.1c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2l-.01 6.2c0 .66-.53 1.2-1.19 1.2-.66 0-1.2-.54-1.2-1.2V4.9zm6.5 6.1c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                                    </span>
                                    :
                                    <span className={"microphone-icon"} onMouseEnter={this.handleMicHover} onMouseLeave={this.handleMicUnHover} onClick={()=>this.toggleMicrophone(document)}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFF"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                                    </span>
                                  }
                                </React.Fragment>
                                }
                              </div>
                              
                            </div> 
                          }                         
                        </div>
                        { !this.state.isUserAuthenticated &&
                          <div className={'welcome-container'}>
                            <p className={'welcome-title-text'}>
                              Welcome to Music Buddy
                            </p>
                            <p className={'welcome-feature-text'}>
                              Here is a list of what this extension can do:
                            </p>
                            <ol className={'welcome-feature-list'}>
                              <li className={'welcome-feature-list-item'}>Create playlists given an artist name and/or album name (keyword: "create playlist")</li>
                              <li className={'welcome-feature-list-item'}>Bridge two artist types together (keyword: "bridge")</li>
                              <li className={'welcome-feature-list-item'}>Give information about an artist (keyword: "tell me about")</li>
                              <li className={'welcome-feature-list-item'}>Ability to request one song (keyword: "play")</li>
                            </ol>
                          </div>
                        }
                        {this.state.showBetaWarning &&
                          <div className={'mic-beta-warning'}>
                            <p className={'mic-beta-warning-text'}>💻 Microphone functionality is in beta development 💻</p>
                            <p className={'mic-beta-warning-text'}>🚧 Please use with caution 🚧</p>
                            <p className={'mic-beta-warning-text'}>😊 We would really prefer if you used the text input 😊</p>
                          </div>
                        }
                        <div className={'watson-response-container'}>
                          {this.state.watsonAssistantResponse && 
                            <p className={'watson-response-text'}>{this.state.watsonAssistantResponse}</p>
                            
                          }
                          {this.state.playlistLink && 
                            <iframe src={this.createEmbedLink(this.state.playlistLink)} 
                                    width="400" 
                                    height="80"
                                    frameBorder={0} 
                                    allowTransparency={true} 
                                    allow="encrypted-media"
                                    style={{marginTop: "15px"}}
                                    >
                            </iframe>
                          }
                        
                          
                          <p style={{color: "red"}}>{this.state.errorText}</p>
                          {(this.state.isUserAuthenticated && this.history.length > 2 && !this.state.historyToggle) && 
                            <div className={"history-button"} onClick={this.historyToggle}>Show more...</div>
                          } 
                          {this.state.historyToggle &&
                            this.makeHistory()
                          }
                          
                        </div>
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
        console.log("user clicked the extension icon");
        toggle();
      }
   } 
);

function toggle(){
   if(app.style.display === "none"){
     app.style.display = "block";
     app.style.height = "325px"
   }else{
     app.style.display = "none";
   }
}

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

