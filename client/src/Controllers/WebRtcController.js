import adapter from 'webrtc-adapter'
import SocketController from './SocketController';
import store from '../Redux/store';
import { ROOMS_SET_REMOTE_STREAM, MEDIA_TOGGLE_MICROPHONE, MEDIA_TOGGLE_MUSIC, CALL_SET_REMOTE_STREAM, MEDIA_TOGGLE_CAMERA, CALL_SET_MEDIA } from '../Redux/constants';
import hark from 'hark'

let WebRtcPeerConnection = false
let activeRoomId = false
let activeCallId = false
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

const mediaConstraintsCall = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
}
const mediaConstraintsRoom = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: false
}

const optionsRoom = {
    'iceServers': [
        {urls: 'stun:173.194.66.127:19302'},
        {
          urls: 'turn:89.223.100.223:3478',
          credential: 'TkYUraQew3RjwTA2JPjAaWL1Q7FIamc',
          username: 'hevachat'
        }
    ],
};

const optionsCall = {
    'iceServers': [
        {urls: 'stun:stun01.sipphone.com'}, 
        {urls: 'stun:stun.ekiga.net'}, 
        {urls: 'stun:stun.fwdnet.net'}, 
        {urls: 'stun:stun.ideasip.com'}, 
        {urls: 'stun:stun.iptel.org'}, 
        {urls: 'stun:stun.rixtelecom.se'}, 
        {urls: 'stun:stun.schlund.de'}, 
        {urls: 'stun:stun.l.google.com:19302'}, 
        {urls: 'stun:stun1.l.google.com:19302'}, 
        {urls: 'stun:stun2.l.google.com:19302'}, 
        {urls: 'stun:stun3.l.google.com:19302'}, 
        {urls: 'stun:stun4.l.google.com:19302'}, 
        {urls: 'stun:stunserver.org'}, 
        {urls: 'stun:stun.softjoys.com'}, 
        {urls: 'stun:stun.voiparound.com'}, 
        {urls: 'stun:stun.voipbuster.com'}, 
        {urls: 'stun:stun.voipstunt.com'}, 
        {urls: 'stun:stun.voxgratia.org'}, 
        {urls: 'stun:stun.xten.com'}, 
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
function getUserMedia(media, callback) {    
    if(isIE || isEdge) {
        navigator.mediaDevices.getUserMedia(media).then(stream => {
            callback(stream)
        })
        .catch((err) => {
            createEmptyStream(callback)
        })
    } else {
        getMedia(
            media, 
            callback, 
            () => {
                if(media.video)
                    getMedia(
                        {audio: true, video: false}, 
                        callback, 
                        () => {
                            createEmptyStream(callback)
                        }
                    );
                else
                    createEmptyStream(callback)
            }
        );
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

function onCallOffer(error, offer, media) {
    if(error) return console.log(error);

    SocketController.sendCallOfferSdp({userId: activeCallId, offerSdp: offer, media})
}

function onCallIceCandidate(e) {
    if(e.candidate) {
        SocketController.sendCallIceCandidate({userId: activeCallId, candidate: e.candidate})
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
        
        getUserMedia({audio: true, video: false}, (stream) => {
            localStream = stream

            localStream.getAudioTracks()[0].enabled = false

            WebRtcPeerConnection = new RTCPC(optionsRoom)
                        
            for (const track of stream.getTracks()) {
                WebRtcPeerConnection.addTrack(track, stream)
            }

            WebRtcPeerConnection.onicecandidate = onRoomIceCandidate

            WebRtcPeerConnection.createOffer(mediaConstraintsRoom).then((offer) => {
                WebRtcPeerConnection.setLocalDescription(offer)
                
                onRoomOffer(null, offer)
            })
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
            localStream.getTracks().forEach(function(track) {
                track.stop();
            });
            localStream = false
        }

        if(remoteStream) {
            remoteStream.getTracks().forEach(function(track) {
                track.stop();
            });
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

        store.dispatch({
            type: MEDIA_TOGGLE_MUSIC,
            payload: true
        })
    },
    roomOnIceCandidate: (e) => {
        if(e.candidate) {
            let wait = setInterval(() => {
                if(WebRtcPeerConnection) {
                    clearInterval(wait)
                    WebRtcPeerConnection.addIceCandidate(e)
                }
            }, 100)
        }
    },
    onRoomAnswerSdp: (sdpAnswer) => {
        let answer = new RTCSessionDescription({
            type: 'answer',
            sdp: sdpAnswer
        })
        
        WebRtcPeerConnection.setRemoteDescription(answer);

        let stream = new MediaStream();

        for (const sender of WebRtcPeerConnection.getReceivers()) {
            stream.addTrack(sender.track);
        }

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
    },

    call: (userId, create = false) => {
        activeCallId = userId

        getUserMedia({audio: true, video: true}, (stream) => {
            localStream = stream

            if(localStream.getVideoTracks()[0])
                localStream.getVideoTracks()[0].enabled = false

            WebRtcPeerConnection = new RTCPC(optionsCall)
            
            for (const track of stream.getTracks()) {
                WebRtcPeerConnection.addTrack(track, stream)
            }

            WebRtcPeerConnection.onicecandidate = onCallIceCandidate

            if(create)
                WebRtcPeerConnection.createOffer(mediaConstraintsCall).then((offer) => {
                    WebRtcPeerConnection.setLocalDescription(offer)
                    onCallOffer(null, offer, 'audio')
                })
            
            store.dispatch({
                type: MEDIA_TOGGLE_MICROPHONE,
                payload: true
            })
        })
    },

    stopCall: () => {
        if(WebRtcPeerConnection) {
            WebRtcPeerConnection.close()
            WebRtcPeerConnection = false
        }

        if(activeCallId) {
            activeCallId = false
        }

        if(localStream) {
            for (const track of localStream.getTracks()) {
                track.stop()
            }

            localStream = false
        }

        if(remoteStream) {
            for (const track of remoteStream.getTracks()) {
                track.stop()
            }
            remoteStream = false
            store.dispatch({
                type: CALL_SET_REMOTE_STREAM,
                payload: false
            })
        }

        store.dispatch({
            type: CALL_SET_REMOTE_STREAM,
            payload: false
        })

        store.dispatch({
            type: MEDIA_TOGGLE_MICROPHONE,
            payload: false
        })

        store.dispatch({
            type: MEDIA_TOGGLE_MUSIC,
            payload: true
        })

        store.dispatch({
            type: MEDIA_TOGGLE_CAMERA,
            payload: false
        })
    },

    callToggleCamera: () => {
        if(localStream) {
            if(localStream.getVideoTracks()[0]) {
                localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled
                store.dispatch({
                    type: MEDIA_TOGGLE_CAMERA,
                    payload: localStream.getVideoTracks()[0].enabled
                })

                SocketController.toggleCameraCall(activeCallId, localStream.getVideoTracks()[0].enabled ? 'video' : 'audio')
            }
        }
    },

    onCallOfferSdp: ({offerSdp, media}) => {
        let wait = setInterval(() => {
            if(WebRtcPeerConnection) {
                clearInterval(wait)
                WebRtcPeerConnection.setRemoteDescription(offerSdp);

                WebRtcPeerConnection.createAnswer(mediaConstraintsCall).then((answer) => {
                    WebRtcPeerConnection.setLocalDescription(answer)
                    SocketController.sendCallAnswerSdp({userId: activeCallId, answerSdp: answer})

                    let stream = new MediaStream();

                    if(remoteStream) {
                        for (const track of remoteStream.getTracks()) {
                            track.stop();
                        }
                        remoteStream = false
                    }

                    for (const sender of WebRtcPeerConnection.getReceivers()) {
                        stream.addTrack(sender.track);
                    }

                    remoteStream = stream

                    store.dispatch({
                        type: CALL_SET_REMOTE_STREAM,
                        payload: stream
                    })
                    store.dispatch({
                        type: CALL_SET_MEDIA,
                        payload: media
                    })
                })
            }
        }, 100);
    },

    onCallAnswerSdp: (answer) => {
        let wait = setInterval(() => {
            if(WebRtcPeerConnection) {
                clearInterval(wait)
                WebRtcPeerConnection.setRemoteDescription(answer);

                let stream = new MediaStream();

                if(remoteStream) {
                    for (const track of remoteStream.getTracks()) {
                        track.stop();
                    }
                    remoteStream = false
                }

                for (const sender of WebRtcPeerConnection.getReceivers()) {
                    stream.addTrack(sender.track);
                }
                
                remoteStream = stream

                store.dispatch({
                    type: CALL_SET_REMOTE_STREAM,
                    payload: remoteStream
                })
            }
        }, 100);
    },

    callOnIceCandidate: (candidate) => {
        if(candidate) {
            let wait = setInterval(() => {
                if(WebRtcPeerConnection) {
                    clearInterval(wait)
                    WebRtcPeerConnection.addIceCandidate(candidate)
                }
            }, 100)
        }
    },
}