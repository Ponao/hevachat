var kurento = require('kurento-client');

var kurentoClient = null;

let wsKurentoUri = 'ws://192.168.10.10:8888/kurento'

let candidatesQueues = {}
let Rooms = {}

// Recover kurentoClient for the first time.
function getKurentoClient(callback) {
    if (kurentoClient !== null) {
        return callback(null, kurentoClient);
    }

    kurento(wsKurentoUri, function(error, _kurentoClient) {
        if (error) {
            console.log("Could not find media server at address " + wsKurentoUri);
            return callback("Could not find media server at address" + wsKurentoUri
                    + ". Exiting with error " + error);
        }

        kurentoClient = _kurentoClient;
        callback(null, kurentoClient);
    });
}

function roomOnIceCandidate(roomId, userId, _candidate) {
    let candidate = kurento.getComplexType('IceCandidate')(_candidate);

    if(Rooms[roomId] && Rooms[roomId].users[userId] && Rooms[roomId].users[userId].webRtcEndpoint) {
        Rooms[roomId].users[userId].webRtcEndpoint.addIceCandidate(candidate);
    } else {
        if(!candidatesQueues[userId]) {
            candidatesQueues[userId] = [];
        }
        candidatesQueues[userId].push(candidate);
    }
}

function roomOfferSdp(roomId, userId, offerSdp, socket, callback) {
    clearCandidatesQueue(userId);

    if(!Rooms[roomId])
        Rooms[roomId] = {users: {}, MediaPipeline: null}
    
    Rooms[roomId].users[userId] = {
        id: userId,
        webRtcEndpoint: false
    }

    if(Rooms[roomId].MediaPipeline) {
        connectToRoomMediaPipeline(roomId, userId, offerSdp, socket, callback)
    } else {
        getKurentoClient((error, kurentoClient) => {
            kurentoClient.create('MediaPipeline', (error, pipeline) => {
                Rooms[roomId].MediaPipeline = pipeline

                connectToRoomMediaPipeline(roomId, userId, offerSdp, socket, callback)
            })
        })
    }
}

function connectToRoomMediaPipeline(roomId, userId, offerSdp, socket, callback) {
    Rooms[roomId].MediaPipeline.create('WebRtcEndpoint', function(error, webRtcEndpoint) {
        Rooms[roomId].users[userId].webRtcEndpoint = webRtcEndpoint

        webRtcEndpoint.on('OnIceCandidate', function(event) {
            let candidate = kurento.getComplexType('IceCandidate')(event.candidate);
            // socket.to(`room.${roomId}`).emit('roomOnIceCandidate', candidate);
        });

        if (candidatesQueues[userId]) {
            while(candidatesQueues[userId].length) {
                let candidate = candidatesQueues[userId].shift();
                webRtcEndpoint.addIceCandidate(candidate);
            }
        }

        webRtcEndpoint.processOffer(offerSdp, function(error, sdpAnswer) {
            if (error) {
                stop(roomId, userId);
                return callback(error);
            }

            if (!Rooms[roomId].users[userId]) {
                stop(roomId, userId);
                return callback('Error not find user');
            }

            for (let [key, value] of Object.entries(Rooms[roomId].users)) {
                if(String(value.id) !== String(userId)) {
                    value.webRtcEndpoint.connect(webRtcEndpoint, function(error) {
                        if (error) {
                            stop(roomId, userId);
                            return callback(error);
                        }

                        webRtcEndpoint.connect(value.webRtcEndpoint, function(error) {
                            if (error) {
                                stop(roomId, userId);
                                return callback(error);
                            }
                        });
                    });
                }
            }

            callback(null, sdpAnswer);
        });
        
        webRtcEndpoint.gatherCandidates(function(error) {
            if (error) {
                stop(roomId, userId);
                return callback(error);
            }
        });
    })
}

function clearCandidatesQueue(userId) {
	if (candidatesQueues[userId]) {
		delete candidatesQueues[userId];
	}
}

const stop = async (roomId, userId) => {
	if (Rooms[roomId] && Rooms[roomId].users[userId]) {
        Rooms[roomId].users[userId].webRtcEndpoint.release();
            
        delete Rooms[roomId].users[userId]
	}

	clearCandidatesQueue(userId);

	if (Rooms[roomId].users.length < 1) {
        if(Rooms[roomId].MediaPipeline)
            Rooms[roomId].MediaPipeline.release();
        delete Rooms[roomId]
    }
}

module.exports = {
    roomOnIceCandidate,
    roomOfferSdp,
    stop
}