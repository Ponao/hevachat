// Internet Explorer 6-11
const isIE = /*@cc_on!@*/false || !!document.documentMode;

// Edge 20+
const isEdge = !isIE && !!window.StyleMedia;

let cameraStream = null;
let stream = document.getElementById("stream");

function catchGetError(callback, err) {
    /** 
     * If u want return empty stream
     **/
    // let audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    // let dest = audioCtx.createMediaStreamDestination()
    // return callback(dest.stream)

    return callback(false, err)
}

const getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

function getUserMedia(media, callback) {    
    if(isIE || isEdge) {
        navigator.mediaDevices.getUserMedia(media).then(stream => {
            callback(stream)
        })
        .catch((err) => {
            catchGetError(callback, err)
        })
    } else {
        getMedia(
            media, 
            callback, 
            (err) => {
                catchGetError(callback, err)
            }
        );
    }
}

function startStreaming() {
    // var capture = document.getElementById("capture");
    // var snapshot = document.getElementById("snapshot");
    
    getUserMedia({video: true, audio: false}, (mediaStream, err) => {
        if(!!mediaStream) {
            cameraStream = mediaStream;
                
            stream.srcObject = mediaStream;
            
            stream.play();
            
            document.getElementById('start').style = 'display: none'
            document.getElementById('stop').style = 'display: block'
            document.getElementById('snap').style = 'display: block'
        } else {
            alert('Something goes worng');

            console.log(err)
        }
    })
}

function stopStreaming() {
    cameraStream.getTracks().forEach(function(track) {
        track.stop();
    });
     
    stream.srcObject = null
    cameraStream = null

    document.getElementById('start').style = 'display: block'
    document.getElementById('stop').style = 'display: none'
    document.getElementById('snap').style = 'display: none'
}

function takeSnap() {
    let canvas = document.getElementById("canvas");
    canvas.width = 300;
    canvas.height = 200;

    canvas.getContext('2d').drawImage(stream, 0, 0, 300, 200);
    let dataURL = canvas.toDataURL();
    document.getElementById('canvasImg').src = dataURL;
}