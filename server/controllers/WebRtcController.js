var kurento = require('kurento-client');

var kurentoClient = null;

let wsKurentoUri = 'ws://85.143.202.123:8888/kurento'

let candidatesQueues = {}
let Rooms = {}

function getUserExistById(id) {
    for (let [key, room] of Object.entries(Rooms)) {
        for (let [key, user] of Object.entries(room.users)) {
            if(String(user._id) === String(id)) {
                return user
            }
        }
    }

    return false
}

function getUserExistBySocketId(id) {
    for (let [key, room] of Object.entries(Rooms)) {
        for (let [key, user] of Object.entries(room.users)) {
            if(String(user.socketId) === String(id)) {
                return user
            }
        }
    }

    return false
}

function addUserRoom(roomId, userId, socketId) {
    if(!Rooms[roomId])
        Rooms[roomId] = {_id: roomId, users: {}, MediaPipeline: null}
    
    Rooms[roomId].users[userId] = {
        _id: userId,
        socketId,
        webRtcEndpoint: false
    }
}

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

    try {
        if(Rooms[roomId] && Rooms[roomId].users[userId] && Rooms[roomId].users[userId].webRtcEndpoint) {
            Rooms[roomId].users[userId].webRtcEndpoint.addIceCandidate(candidate);
        } else {
            if(!candidatesQueues[userId]) {
                candidatesQueues[userId] = [];
            }
            candidatesQueues[userId].push(candidate);
        }
    } catch {}
}

function roomOfferSdp(roomId, userId, offerSdp, socket, callback) {
    clearCandidatesQueue(userId);

    if(Rooms[roomId].MediaPipeline) {
        try {
            connectToRoomMediaPipeline(roomId, userId, offerSdp, socket, callback)
        } catch {}
    } else {
        try {
            getKurentoClient((error, kurentoClient) => {
                if(error) {
                    return console.log(error)
                }
                kurentoClient.create('MediaPipeline', (error, pipeline) => {
                    if(error) {
                        return console.log(error)
                    }
                    Rooms[roomId].MediaPipeline = pipeline

                    connectToRoomMediaPipeline(roomId, userId, offerSdp, socket, callback)
                })
            })
        } catch {}
    }
}

function connectToRoomMediaPipeline(roomId, userId, offerSdp, socket, callback) {
    Rooms[roomId].MediaPipeline.create('WebRtcEndpoint', function(error, webRtcEndpoint) {
        if(error) {
            return console.log(error)
        }
        Rooms[roomId].users[userId].webRtcEndpoint = webRtcEndpoint

        webRtcEndpoint.on('OnIceCandidate', function(event) {
            let candidate = kurento.getComplexType('IceCandidate')(event.candidate);
            socket.emit('roomOnIceCandidate', candidate);
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
                if(String(value._id) !== String(userId)) {
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

function stopBySocketId(socketId) {
    for (let [key, room] of Object.entries(Rooms)) {
        for (let [key, user] of Object.entries(room.users)) {
            if(user.socketId == socketId) {
                if(Rooms[room._id].users[user._id].webRtcEndpoint)
                    Rooms[room._id].users[user._id].webRtcEndpoint.release();

                delete Rooms[room._id].users[user._id]

                return
            }
        }
    }
}

module.exports = {
    roomOnIceCandidate,
    roomOfferSdp,
    stop,
    getUserExistById,
    stopBySocketId,
    addUserRoom,
    getUserExistBySocketId
}