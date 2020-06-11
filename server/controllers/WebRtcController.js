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
        Rooms[roomId] = {_id: roomId, users: {}, composite: null, MediaPipeline: null}
    
    Rooms[roomId].users[userId] = {
        _id: userId,
        socketId,
        webRtcEndpoint: false,
        hubPort: false
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

                    Rooms[roomId].MediaPipeline.create('Composite',  function( error, composite ) {
                        if (error) {
                            return callback(error);
                        }
                        Rooms[roomId].composite = composite;
                    });

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

            // for (let [key, value] of Object.entries(Rooms[roomId].users)) {
            //     if(String(value._id) !== String(userId)) {
            //         webRtcEndpoint.connect(value.webRtcEndpoint, function(error) {
            //             if (error) {
            //                 stop(roomId, userId);
            //                 return callback(error);
            //             }

            //             value.webRtcEndpoint.connect(webRtcEndpoint, function(error) {
            //                 if (error) {
            //                     stop(roomId, userId);
            //                     return callback(error);
            //                 }
            //             });
            //         });
            //     }
            // }

            callback(null, sdpAnswer);
        });
        
        webRtcEndpoint.gatherCandidates(function(error) {
            if (error) {
                stop(roomId, userId);
                return callback(error);
            }
        });

        Rooms[roomId].composite.createHubPort( function(error, hubPort) {
            if (error) {
                return callback(error);
            }

            Rooms[roomId].users[userId].hubPort = hubPort

            Rooms[roomId].users[userId].webRtcEndpoint.connect(Rooms[roomId].users[userId].hubPort, "AUDIO", function(error) {
                if (error) {
                    return callback(error);
                }
            })

            Rooms[roomId].users[userId].hubPort.connect(Rooms[roomId].users[userId].webRtcEndpoint, "AUDIO", function(error) {
                if (error) {
                    return callback(error);
                }
            })
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
        if(Rooms[roomId].users[userId].webRtcEndpoint)
            Rooms[roomId].users[userId].webRtcEndpoint.release();

        if(Rooms[roomId].users[userId].hubPort)
            Rooms[roomId].users[userId].hubPort.release();
            
        delete Rooms[roomId].users[userId]
	}

	clearCandidatesQueue(userId);

	if (Rooms[roomId].users.length < 1) {
        if(Rooms[roomId].MediaPipeline)
            Rooms[roomId].MediaPipeline.release();
        
        if(Rooms[roomId].composite)
            Rooms[roomId].composite.release();
        delete Rooms[roomId]
    }
}

function stopBySocketId(socketId) {
    for (let [key, room] of Object.entries(Rooms)) {
        for (let [key, user] of Object.entries(room.users)) {
            if(user.socketId == socketId) {
                if(Rooms[room._id].users[user._id].webRtcEndpoint)
                    Rooms[room._id].users[user._id].webRtcEndpoint.release();
                
                if(Rooms[room._id].users[user._id].hubPort)
                    Rooms[room._id].users[user._id].hubPort.release();

                delete Rooms[room._id].users[user._id]

                if (Rooms[room._id].users.length < 1) {
                    if(Rooms[room._id].MediaPipeline)
                        Rooms[room._id].MediaPipeline.release();

                    if(Rooms[room._id].composite)
                        Rooms[room._id].composite.release();

                    delete Rooms[room._id]
                }

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