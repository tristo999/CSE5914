/* src/content.js */
/*global chrome*/
import AudioAnalyser from './components/audio-analyzer/audio-analyzer';
import React from 'react';
import ReactDOM from 'react-dom';
import Frame, { FrameContextConsumer }from 'react-frame-component';
import "./content.css";

<<<<<<< HEAD

=======
var token = '';
>>>>>>> origin/feature/GoogleIdentify

class ExtensionBase extends React.Component{
   constructor(props) {
      super(props);
       this.state = { audio: null ,test: null, spotify: null};
      this.toggleMicrophone = this.toggleMicrophone.bind(this);

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
      });
       this.setState({ audio });


      // if(localStorage.getItem("audioRecoder") != null && JSON.parse(localStorage.getItem("audioRecoder")).length > 0) {
      //    let currentMediaObj = JSON.parse(localStorage.getItem("audioRecoder"));
      //   let newMediaStreamObj = currentMediaObj.clone();
      //   this.setState({ audio: newMediaStreamObj });
      // }
      // else {
      //   this.setAudioGlobalStore();
      //   this.setState({ audio: JSON.parse(localStorage.getItem("audioRecoder")) });
      // }    
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

    testButton() {
            var event = document.createEvent('Event');
            event.initEvent('hello');
            document.dispatchEvent(event);
			console.log("Opening AUTH");

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
                            <h1>I wish this would work :(</h1>

                            <button onClick={this.toggleMicrophone}>
	                               {this.state.audio ? 'Stop microphone' : 'Get microphone input'}
                           </button>
                              {this.state.audio ? <AudioAnalyser audio={this.state.audio} /> : ''}
<<<<<<< HEAD
=======
                          </div>
                          <div>
>>>>>>> origin/feature/GoogleIdentify
                           <button onClick={this.testButton}>
                               {this.state.test ? 'SpotifyIsDumb' : 'LoginToSpotify'}
                           </button>
							<button onClick={this.testButton}>
                               {this.state.test ? 'CreatePlaylist' : 'CreatePlaylist'}
                           </button>
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

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {

  if (msg.action === 'access_token') {
	console.log(msg.token)
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
