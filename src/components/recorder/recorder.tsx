// import * as React from 'react';

// interface Props {
// }


// export default class Recorder extends React.Component<Props,any> {
//     constructor(props: any) {
//         super(props);
//     }
    
//     public componentDidMount () {
//         navigator.getUserMedia = (navigator.getUserMedia ||
//                                   navigator.mozGetUserMedia ||
//                                   navigator.msGetUserMedia ||
//                                   navigator.webkitGetUserMedia)
    
//         if (navigator.getUserMedia && window.MediaRecorder) {
//           const constraints = {audio: true}
//           this.chunks = []
//           const { blobOpts, onStop, onError, mediaOpts, onPause, onResume, onStart, gotStream } = this.props
    
//           const onErr = err => {
//             console.warn(err)
//             if (onError) onError(err)
//           }
    
//           const onSuccess = stream => {
//             this.mediaRecorder = new window.MediaRecorder(stream, mediaOpts || {})
    
//             this.mediaRecorder.ondataavailable = e => {
//               this.chunks.push(e.data)
//             }
    
//             this.mediaRecorder.onstop = e => {
//               const blob = new window.Blob(this.chunks, blobOpts || {type: 'audio/wav'})
//               this.chunks = []
//               onStop(blob)
//             }
    
//             this.mediaRecorder.onerror = onErr
//             if (onPause) this.mediaRecorder.onpause = onPause
//             if (onResume) this.mediaRecorder.onresume = onResume
//             if (onStart) this.mediaRecorder.onstart = onStart
//             this.stream = stream
//             if (gotStream) gotStream(stream)
//           }
    
//           navigator.getUserMedia(constraints, onSuccess, onErr)
//         } else {
//           console.warn('Audio recording APIs not supported by this browser')
//           const { onMissingAPIs } = this.props
//           if (onMissingAPIs) {
//             onMissingAPIs(navigator.getUserMedia, window.MediaRecorder)
//           } else {
//             window.alert('Your browser doesn\'t support native microphone recording. For best results, we recommend using Google Chrome or Mozilla Firefox to use this site.')
//           }
//         }
//     }
    
//     public componentDidUpdate (prevProps) {
//         if (this.props.command && this.props.command !== 'none' && prevProps.command !== this.props.command) {
//           this[this.props.command]()
//         }
//     }

//     public componentWillUnmount () {
//         if (this.props.onUnmount) this.props.onUnmount(this.stream)
//     }

//     private start () {
//         this.mediaRecorder.start()
//     }
    
//     private stop () {
//         this.mediaRecorder.stop()
//     }
    
//     private pause () {
//         this.mediaRecorder.pause()
//     }
    
//     private resume () {
//         this.mediaRecorder.resume()
//     }
    
//     public render() {
//         return false;
//     }
// }



// // const Recorder = React.createClass({


// //   propTypes: {
// //     command: PropTypes.oneOf(['start', 'stop', 'pause', 'resume', 'none']),
// //     onStop: PropTypes.func.isRequired,
// //     onMissingAPIs: PropTypes.func,
// //     onError: PropTypes.func,
// //     onPause: PropTypes.func,
// //     onStart: PropTypes.func,
// //     onResume: PropTypes.func,
// //     onUnmount: PropTypes.func,
// //     gotStream: PropTypes.func,
// //     blobOpts: PropTypes.object,
// //     mediaOpts: PropTypes.object
// //   }
// // });