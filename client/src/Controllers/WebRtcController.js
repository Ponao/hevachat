import adapter from 'webrtc-adapter'
import SocketController from './SocketController';
import store from '../Redux/store';
import { ROOMS_SET_REMOTE_STREAM, MEDIA_TOGGLE_MICROPHONE, MEDIA_TOGGLE_MUSIC } from '../Redux/constants';
import hark from 'hark'

let WebRtcPeerConnection = false
let activeRoomId = false
let localStream = false
let remoteStream = false
let speechEvents = false

// Internet Explorer 6-11
const isIE = /*@cc_on!@*/false || !!document.documentMode;

// Edge 20+
const isEdge = !isIE && !!window.StyleMedia;

const RTCPC = RTCPeerConnection || window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
const RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
const RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

const mediaConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: false
}

const options = {
    iceServers: [
        {urls: 'stun:173.194.66.127:19302'}, 
        {
          urls: 'turn:89.223.100.223:3478',
          credential: 'TkYUraQew3RjwTA2JPjAaWL1Q7FIamc',
          username: 'hevachat'
        }
    ],
};

function createEmptyStream(callback) {
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    let dest = audioCtx.createMediaStreamDestination()
    return callback(dest.stream)
}

const getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
// navigator.mediaDevices.getUserMedia 
function getUserMedia(callback) {    
    if(isIE || isEdge) {
        navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(stream => {
            callback(stream)
        })
        .catch((err) => {
            createEmptyStream(callback)
        })
    } else {
        getMedia({
            audio: true,
            video: false
        }, 
        callback, 
        () => {
            createEmptyStream(callback)
        });
    }

    function onerror(e) {
        console.log(JSON.stringify(e, null, '\t'));
    }
}

function onRoomOffer(error, offer) {
    if(error) return console.log(error);

    SocketController.sendRoomOfferSdp({roomId: activeRoomId, offerSdp: offer.sdp})
}

function onRoomIceCandidate(e) {  
    if(e.candidate) {
        SocketController.sendRoomIceCandidate({roomId: activeRoomId, candidate: e.candidate})
    } 
}

export default { 
    // Global functions
    toggleMicrophone() {
        localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled
        store.dispatch({
            type: MEDIA_TOGGLE_MICROPHONE,
            payload: localStream.getAudioTracks()[0].enabled
        })
    },
    toggleMusic() {
        remoteStream.getAudioTracks()[0].enabled = !remoteStream.getAudioTracks()[0].enabled

        store.dispatch({
            type: MEDIA_TOGGLE_MUSIC,
            payload: remoteStream.getAudioTracks()[0].enabled
        })
    },

    // Rooms conference
    connectRoom: (roomId) => {
        activeRoomId = roomId
        
        getUserMedia((stream) => {
            localStream = stream
            // let audioCtx = new (window.AudioContext || window.webkitAudioContext)()
            // let dest = audioCtx.createMediaStreamDestination ();

            localStream.getAudioTracks()[0].enabled = false

            WebRtcPeerConnection = new RTCPC(options)
            
            WebRtcPeerConnection.addStream(stream)

            WebRtcPeerConnection.onicecandidate = onRoomIceCandidate

            WebRtcPeerConnection.createOffer(mediaConstraints).then((offer) => {
                WebRtcPeerConnection.setLocalDescription(offer);
                
                onRoomOffer(null, offer)
            });
        })
    },
    leaveRoom({roomId, lang}) {
        if(WebRtcPeerConnection) {
            WebRtcPeerConnection.close()
            WebRtcPeerConnection = false
        }

        if(activeRoomId) {
            SocketController.leaveRoom({roomId, lang})
            activeRoomId = false
        }

        if(localStream) {
            localStream.getAudioTracks()[0].stop()
            localStream = false
        }

        if(remoteStream) {
            remoteStream.getAudioTracks()[0].stop()
            remoteStream = false
        }

        if(speechEvents) {
            speechEvents.stop()
            speechEvents = false
        }

        store.dispatch({
            type: MEDIA_TOGGLE_MICROPHONE,
            payload: false
        })
    },
    roomOnIceCandidate: (e) => {
        if(WebRtcPeerConnection)
            WebRtcPeerConnection.addIceCandidate(e)
    },
    onRoomAnswerSdp: (sdpAnswer) => {
        let answer = new RTCSessionDescription({
            type: 'answer',
            sdp: sdpAnswer
        })
        
        WebRtcPeerConnection.setRemoteDescription(answer);

        let stream = new MediaStream();

        WebRtcPeerConnection.getReceivers().forEach(function (sender) {
            stream.addTrack(sender.track);
        });

        remoteStream = stream

        store.dispatch({
            type: ROOMS_SET_REMOTE_STREAM,
            payload: stream
        })

        speechEvents = hark(localStream, {});
 
        speechEvents.on('speaking', function() {
            SocketController.sendRoomSpeaking({roomId: activeRoomId})
        });
    
        speechEvents.on('stopped_speaking', function() {
            SocketController.sendRoomStopSpeaking({roomId: activeRoomId})
        });
    }
}