// App
import React from 'react'
import {PageSettings} from '../PageSettings'
import SocketController from '../../Controllers/SocketController'

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../../Redux/actions/rooms'
import { bindActionCreators } from 'redux'

// Material
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core'
import { withRouter } from 'react-router-dom'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Dialog from '../../Partials/Chat/Dialog'
import Input from '../../Partials/Chat/Input'

const messagesList = [
    {
        _id: 'kalwkdowdw232ASdwwd',
        createdAt: "2020-05-22T19:33:21.547Z",
        dialogId: "",
        isEdit: false,
        isRead: false,
        recentMessages: [],
        roomId: "",
        images: [],
        sounds: [],
        files: [],
        text: "What are you doing? asd.ru",
        user: {
            createdAt: "2020-05-21T22:54:13.498Z",
            email: "pffbread@gmail.com",
            online: true,
            onlineAt: "2020-05-22T19:33:16.445Z",
            roomLang: "eng",
        }
    },
    {
        _id: 'kalwkdowdw232ASdwwd',
        createdAt: "2020-05-22T19:33:21.547Z",
        dialogId: "",
        isEdit: false,
        isRead: false,
        recentMessages: [],
        roomId: "",
        images: ['https://www.proplay.ru/images/users/gallery/127866/187721_l.jpg'],
        sounds: [],
        files: [],
        text: "Soprano said, We never never ever sang together and Roméo and Juliette already is a beautiful story. I didn’t sing it for a very long time now",
        user: {
            createdAt: "2020-05-21T22:54:13.498Z",
            email: "pffbread@gmail.com",
            online: true,
            onlineAt: "2020-05-22T19:33:16.445Z",
            roomLang: "eng",
        }
    },
    {
        _id: 'kalwkdowdw232ASdwwd',
        createdAt: "2020-05-22T19:33:21.547Z",
        dialogId: "",
        isEdit: false,
        isRead: false,
        recentMessages: [
            {
                _id: 'kalwkdowdw232ASdwwd',
                createdAt: "2020-05-22T19:33:21.547Z",
                dialogId: "",
                isEdit: false,
                isRead: false,
                recentMessages: [],
                roomId: "",
                images: ['https://www.proplay.ru/images/users/gallery/127866/187721_l.jpg'],
                sounds: [],
                files: [],
                text: "What are you doing?",
                user: {
                    createdAt: "2020-05-21T22:54:13.498Z",
                    email: "pffbread@gmail.com",
                    online: true,
                    onlineAt: "2020-05-22T19:33:16.445Z",
                    roomLang: "eng",
                }
            },
            {
                _id: 'kalwkdowdw232ASdwwd',
                createdAt: "2020-05-22T19:33:21.547Z",
                dialogId: "",
                isEdit: false,
                isRead: false,
                recentMessages: [
                    {
                        _id: 'kalwkdowdw232ASdwwd',
                        createdAt: "2020-05-22T19:33:21.547Z",
                        dialogId: "",
                        isEdit: false,
                        isRead: false,
                        recentMessages: [],
                        roomId: "",
                        images: ['https://www.proplay.ru/images/users/gallery/127866/187721_l.jpg'],
                        sounds: [],
                        files: [],
                        text: "What are you doing?",
                        user: {
                            createdAt: "2020-05-21T22:54:13.498Z",
                            email: "pffbread@gmail.com",
                            online: true,
                            onlineAt: "2020-05-22T19:33:16.445Z",
                            roomLang: "eng",
                        }
                    },
                ],
                roomId: "",
                images: ['https://www.proplay.ru/images/users/gallery/127866/187721_l.jpg'],
                sounds: [],
                files: [],
                text: "What are you doing?",
                user: {
                    createdAt: "2020-05-21T22:54:13.498Z",
                    email: "pffbread@gmail.com",
                    online: true,
                    onlineAt: "2020-05-22T19:33:16.445Z",
                    roomLang: "eng",
                }
            },
        ],
        roomId: "",
        images: [],
        sounds: [],
        files: [],
        text: "What are you doing?",
        user: {
            createdAt: "2020-05-21T22:54:13.498Z",
            email: "pffbread@gmail.com",
            online: true,
            onlineAt: "2020-05-22T19:33:16.445Z",
            roomLang: "eng",
        }
    },
]

class Room extends React.Component {
    static contextType = PageSettings;

    state = {
        isOpenCreateRoom: false
    }

    componentDidMount() {
        this.context.toggleHeader(false)

        fetch(`http://localhost:8000/api/room/get`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                id: this.props.match.params.id
            })
        })
        .then(response => response.json())
        .then(room => {
            this.props.roomsActions.joinRoom(room)
        })
    }

    componentWillUnmount() {
        this.props.roomsActions.leaveRoom(this.props.rooms.activeRoom._id, this.props.rooms.activeRoom.lang)
    }

    test() {
        fetch(`http://localhost:8000/api/user/test`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                
            })
        })
        .then(response => response.json())
        .then(room => {
            console.log(room)
        })
    }

    render() {
        return (
            <>  
                <div className="col-md-3">
                    <div className="theme-header">
                        <div className="back-btn" onClick={() => {
                            this.props.history.goBack()
                        }}>
                            <ArrowBackIosIcon fontSize="small" style={{color: '#008FF7'}} />
                        </div>
                        
                        <h2 className="theme-title">{this.props.rooms.activeRoom.title}</h2>
                    </div>


                    <div className="theme-sidebar">
                        <Dialog messages={messagesList} />
                        <Input />
                    </div>
                </div>
                

                <div className="col-md-9 theme-screen" onClick={() => {this.test()}}>
                    CONTENT
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        rooms: state.rooms
    }
}

function mapDispatchToProps(dispatch) {
    return {
        roomsActions: bindActionCreators(roomsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Room))