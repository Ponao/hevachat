// App
import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars';

// Material
import FileCopyIcon from '@material-ui/icons/FileCopy';

// Redux
import { connect } from 'react-redux'

import { withRouter } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import { urlApi } from '../../config';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import GetAppIcon from '@material-ui/icons/GetApp';

class Images extends React.Component {
    state = {
        isFetching: true,
        files: []
    }

    componentDidMount() {
        if(this.props.match.params.id) {
            let type = this.props.history.location.pathname.substring(1,5)
            this.setState({isFetching: true})
            let body
            if(type === 'chat') {
                body = {
                    userId: this.props.match.params.id,
                    type: 'file'
                }
            } else {
                body = {
                    roomId: this.props.match.params.id,
                    type: 'file'
                }
            }
            fetch(`${urlApi}/api/${type === 'chat' ? 'dialog' : 'room'}/get-investments`, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.props.user.apiToken}`,
                },
                body: JSON.stringify(body)
            })
            .then(response => response.json())
            .then(files => {
                if(!files.error) {
                    files = files.map(x => x.data)
                    
                    this.setState({files, isFetching: false})
                }
            })
        }
    }

    onScroll() {

    }
    
    render() {
        return <Scrollbars
            ref={(ref) => {this.roomsBlock = ref}}
            renderTrackVertical={props => <div className="track-vertical"/>}
            renderThumbVertical={props => <div className="thumb-vertical"/>}
            className="scroll investment-images"
            onScroll={() => {this.onScroll()}}
            style={{height: 340, marginLeft: 15}}
            autoHide
        >
            {this.state.isFetching && <CircularProgress style={{
                    color: '#008FF7',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    margin: 'auto',
                    top: 'calc(50% - 20px)',
                }} />}
            {this.state.files.map((file, index) => {
                return (
                    <div className="message-file" style={{cursor: 'pointer'}} key={index} onClick={(e) => {
                        window.open(file.path, '_self');
                    }}>
                        <InsertDriveFileOutlinedIcon className="file-icon" style={{color: '#008FF7'}} />
                        <div className="message-file-info">
                            <p className="message-file-name">{file.name}</p>
                            <p className="message-file-size">{file.size > 999 ? (file.size / 1000).toFixed(1) + ' mb' : Math.ceil(file.size) + ' kb'}</p>
                        </div>
                        <GetAppIcon className="download-icon" style={{color: '#008FF7'}} />
                    </div>
                )
            })}
            {(!this.state.files.length && !this.state.isFetching) && <div className="data-empty">
                <FileCopyIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                <p>Here will placed files from this dialog</p>
            </div>}
        </Scrollbars>
    }
}

const mapStateToProps = state => {
    return {
        users: state.users,
        user: state.user
    }
}

export default connect(mapStateToProps)(withRouter(Images))