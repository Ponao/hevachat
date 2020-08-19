// Internet Explorer 6-11
const isIE = /*@cc_on!@*/false || !!document.documentMode;

// Edge 20+
const isEdge = !isIE && !!window.StyleMedia;

function catchGetError(callback, err) {
    /** 
     * If u want return empty stream
     **/
    // let audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    // let dest = audioCtx.createMediaStreamDestination()
    // return callback(dest.stream)

    return callback(false, err)
}

const getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia).bind(navigator);

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
    let cameraStream = null;
    let stream = document.getElementById("stream");
    // var capture = document.getElementById("capture");
    // var snapshot = document.getElementById("snapshot");
    
    getUserMedia({video: true, audio: true}, (mediaStream, err) => {
        if(!!mediaStream) {
            cameraStream = mediaStream;
                
            stream.srcObject = mediaStream;
            
            stream.play();
        } else {
            alert('Something goes worng');

            console.log(err)
        }
    })
}