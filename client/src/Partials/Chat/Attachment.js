// App
import React from 'react'

// Material
import CloseIcon from '@material-ui/icons/Close';
import { getHM } from '../../Controllers/TimeController';
import Linkify from 'react-linkify';
import Button from '@material-ui/core/Button';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';

import PerfectScrollbar from 'react-perfect-scrollbar'

const componentDecorator = (href, text, key) => (
    <a href={href} onClick={(e) => {e.stopPropagation()}} key={key} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
);

class Attachment extends React.Component {
    render() {
        return (
            <PerfectScrollbar 
                className="dialog-attachment" 
            >
            <div style={{width: '100%', display: 'flex', flexWrap: 'wrap'}}>
                {!!this.props.recentMessages.length && <div className="message-attachment">
                    <Button className="btn-cancel-select" style={{width: 60}} onClick={() => {this.props.unSelectRecentMessages()}}>
                        <CloseIcon style={{color: '#99AABB'}} />
                    </Button>

                    {this.props.recentMessages.length === 1 &&<div className="col message-recent">
                        <h3 className="user-name">{`${this.props.recentMessages[0].user.name.first} ${this.props.recentMessages[0].user.name.last}`} <span className="time-at">{getHM(this.props.recentMessages[0].createdAt)}</span></h3>
                        <p className="message-text"><Linkify componentDecorator={componentDecorator}>{
                            this.props.recentMessages[0].text ? 
                            this.props.recentMessages[0].text : `Вложения [${
                                this.props.recentMessages[0].images.length+
                                this.props.recentMessages[0].files.length+
                                this.props.recentMessages[0].sounds.length+
                                this.props.recentMessages[0].recentMessages.length

                            }]`
                        }</Linkify></p>
                    </div>}

                    {this.props.recentMessages.length > 1 &&<div className="col message-recent">
                        <h3 className="user-name">Attachment messages</h3>
                        <p className="message-text">{`${this.props.recentMessages.length} messages`}</p>
                    </div>}
                </div>}

                {!!this.props.images.length && <div className="image-attachment">
                    {this.props.images.map((image, index, images) => {
                        return <div key={index} className="image-container" style={{marginRight: images[index+1] ? 5 : 0}}>
                            <span className="btn-delete-image" onClick={() => {this.props.removeImage(image.id)}}>
                                <CloseIcon style={{color: '#fff'}} />
                            </span>
                            <img src={image.path} alt="Attach" />
                        </div>
                    })}
                </div>}

                {!!this.props.sounds.length && <div className="sound-attachment">
                    {this.props.sounds.map((sound, index, sounds) => {
                        return <div key={index} className="sound-container">
                            <Button className="btn-cancel-select" style={{minWidth: 60}} onClick={() => {this.props.removeSound(sound.id)}}>
                                <CloseIcon style={{color: '#99AABB'}} />
                            </Button>

                            <MusicNoteIcon style={{color: '#008FF7'}} />

                            <p className="sound-attachment-name">{sound.name}</p>
                        </div>
                    })}
                </div>}

                {!!this.props.files.length && <div className="sound-attachment">
                    {this.props.files.map((file, index, files) => {
                        return <div key={index} className="sound-container">
                            <Button className="btn-cancel-select" style={{minWidth: 60}} onClick={() => {this.props.removeFile(file.id)}}>
                                <CloseIcon style={{color: '#99AABB'}} />
                            </Button>

                            <InsertDriveFileOutlinedIcon style={{color: '#008FF7'}} />

                            <p className="sound-attachment-name">{file.name}</p>
                        </div>
                    })}
                </div>}
            </div>
            </PerfectScrollbar>
        )
    }
}

export default Attachment