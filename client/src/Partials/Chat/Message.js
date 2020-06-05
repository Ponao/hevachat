// App
import React from 'react'
import Avatar from '../User/Avatar'
import { getHM, timeAt } from '../../Controllers/TimeController'
import { CSSTransitionGroup } from 'react-transition-group';
import MessageComponent from './Message'

// Material
import CheckIcon from '@material-ui/icons/Check';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import GetAppIcon from '@material-ui/icons/GetApp';

import Audio from './Audio';

import Linkify from 'react-linkify'

// Redux
import { connect } from 'react-redux'
import ActionMenu from '../ActionMenu'
import { randomInteger } from '../../Controllers/FunctionsController'

const componentDecorator = (href, text, key) => (
    <a href={href} onClick={(e) => {e.stopPropagation()}} key={key} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
);

class Message extends React.PureComponent {
    state = {
        randomId: randomInteger(0, 100000)
    }

    render() {
        let isHistoryDate = true
        let moreHour = false

        if(this.props.messages[this.props.index-1]) {
            let date1 = new Date(this.props.message.createdAt);
            let date2 = new Date(this.props.messages[this.props.index-1].createdAt);
            
            if(
                date1.getFullYear() === date2.getFullYear() && 
                date1.getMonth() === date2.getMonth() && 
                date1.getDate() === date2.getDate()
            ) {
                isHistoryDate = false
            }

            let diffHours = Math.abs(date1 - date2) / 36e5;
            
            if(diffHours > 1) {
                moreHour = true
            }
        }

        let isFirst = (
            ((this.props.messages[this.props.index-1] && 
            this.props.messages[this.props.index-1].user._id !== this.props.message.user._id) || 
            !this.props.messages[this.props.index-1]) || moreHour
        )

        return (<>
            {isHistoryDate && <div className="history-date">{timeAt(new Date(this.props.message.createdAt))}</div>}

            <div
                className={`message ${this.props.selected ? 'selected' : ''}`} 
                onClick={(e) => {
                    if(this.props.message.isLoading || this.props.message.isError)
                        return

                    if(this.props.selected) {
                        this.props.unSelect(this.props.message._id)
                    } else {
                        this.props.onSelect(this.props.message)
                    }
                }}
                style={{
                    background: this.props.isRecent ? 'none' : (this.props.message.isLoading || this.props.message.isError) ? '#fff' : (this.props.message.user._id !== this.props.user._id && !this.props.message.isRead) ? '#EFF4F8' : '', 
                    cursor: (this.props.message.isLoading || this.props.message.isError) ? 'default' : '',
                    padding: this.props.isRecent ? '8px 14px 8px 6px' : ''
                }}
            >
                {
                    (isFirst || isHistoryDate) && !this.props.isRecent && 
                    <Avatar style={{width: 32, height: 32, fontSize: 14, lineHeight: '14px', fontWeight: 600, backgroundColor: `rgb(${this.props.message.user.color})`}} name={this.props.message.user.name.first.charAt(0)+this.props.message.user.name.last.charAt(0)} />
                }

                {
                    (!isFirst && !isHistoryDate && !this.props.isRecent) &&
                    <div style={{width: 46}} />
                }

                {(!this.props.message.isLoading && !this.props.message.isError) && this.props.canSelect && <span className={`select-indicator ${this.props.selected ? 'active' : ''}`}>
                    {this.props.selected && <CheckIcon style={{
                        color: '#fff', 
                        fontSize: 16,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        margin: 'auto'
                    }} />}
                </span>}
                
                <div className="content col">
                    {
                        (isFirst || isHistoryDate) &&
                        <h3 className="user-name" style={{color: this.props.message.user._id === this.props.user._id ? '#FF3333' : ''}}>{`${this.props.message.user.name.first} ${this.props.message.user.name.last}`} <span className="time-at">{getHM(this.props.message.createdAt)}</span></h3>
                    }

                    {this.props.message.text && <p className="message-text">
                        <Linkify componentDecorator={componentDecorator}>
                            {this.props.message.text.replace(/&nbsp;/g, '')
                                .replace(/&amp;/g, '&')
                                .replace(/&gt;/g, '>')
                                .replace(/&lt;/g, '<')
                                // .replace(/(\r\n|\n|\r)/gm, "")
                                .replace(/(^\s*(?!.+)\n+)|(\n+\s+(?!.+)$)/g, "")
                                .replace(/(\r\n|\r|\n){2,}/g, '$1\n')
                            }
                        </Linkify>
                    </p>}

                    {!!this.props.message.recentMessages.length && this.props.countRecent > 1 && <p className="message-text">
                        {`Attachmend messages [${this.props.message.recentMessages.length}]`}    
                    </p>}

                    {!!this.props.message.images.length && <div className="message-images">
                        {this.props.message.images.map((image, index, images) => {
                            let width
                            let isBlur = false

                            if(images.length <= 3 && images.length !== 2) {
                                width = index === 0 ? '100%' : '50%' 
                            } else {
                                width = '50%'
                            }

                            if(images.length > 4 && index === 3)
                                isBlur = true
                            
                            if(index > 3)
                                return null

                            if(isBlur)
                                return <div key={index} className="image" style={{width}}>
                                    <div className="image-blur" onClick={(e) => {
                                        e.stopPropagation()
                                        this.props.openSlider(images)
                                    }}>
                                        <span>{`+${images.length-3}`}</span>
                                        <img key={index} src={image.path} alt={image.name} />
                                    </div>
                                </div>

                            return  <div key={index} className="image" style={{width}}>
                                <img onClick={(e) => {
                                    e.stopPropagation()
                                    this.props.openSlider(images)
                                }} src={image.path} alt={image.name} />
                            </div>
                        })}
                    </div>}

                    {!!this.props.message.sounds.length && <div className="message-sounds">
                        {this.props.message.sounds.map((sound, index, images) => {
                            return <Audio
                                key={index}
                                fileName={sound.name}
                                src={sound.path}
                            />
                        })}
                    </div>}
                    
                    
                    {!!this.props.message.files.length && <div className="message-files">
                        {this.props.message.files.map((file, index, images) => {
                            return <div className="message-file" key={index} onClick={(e) => {
                                e.stopPropagation()
                                window.open(file.path, '_self');
                            }}>
                                <InsertDriveFileOutlinedIcon className="file-icon" style={{color: '#008FF7'}} />
                                <div className="message-file-info">
                                    <p className="message-file-name">{file.name}</p>
                                    <p className="message-file-size">{file.size > 999 ? (file.size / 1000).toFixed(1) + ' mb' : Math.ceil(file.size) + ' kb'}</p>
                                </div>
                                <GetAppIcon className="download-icon" style={{color: '#008FF7'}} />
                            </div>
                        })}
                    </div>}
                    

                    {!!this.props.message.recentMessages.length && this.props.countRecent < 2 && <div className="message-recent">
                        {this.props.message.recentMessages.map((message, index, messages) => {
                            return <MessageComponent countRecent={this.props.countRecent+1} isRecent={true} onSelect={() => {}} openSlider={(sliderImages) => {this.props.openSlider(sliderImages)}} key={index} message={message} messages={messages} index={index} />
                        })}
                    </div>}
                </div>
                
                {!this.props.isRecent && !this.props.canSelect && <div className="message-status">
                    <CSSTransitionGroup 
                        transitionName="message-status-transition"
                        transitionEnterTimeout={100}
                        transitionLeaveTimeout={100}>
                        {!this.props.message.isLoading && !this.props.message.isError && this.props.message.isEdit && <EditOutlinedIcon style={{color: '#B8C3CF'}} />}
                    </CSSTransitionGroup>
                </div>}
                {!this.props.isRecent && !this.props.canSelect && <div className="message-status">
                    <CSSTransitionGroup 
                        transitionName="message-status-transition"
                        transitionEnterTimeout={100}
                        transitionLeaveTimeout={100}>
                            {this.props.message.user._id === this.props.user._id && this.props.message.isLoading && <QueryBuilderIcon style={{color: '#B8C3CF'}} />}
                            
                            {this.props.message.user._id === this.props.user._id && !this.props.message.isLoading && !this.props.message.isError && !this.props.message.isRead && <DoneIcon style={{color: '#B8C3CF'}} />}
                            {this.props.message.user._id === this.props.user._id &&!this.props.message.isLoading && !this.props.message.isError && this.props.message.isRead && <DoneAllIcon style={{color: '#008FF7'}} />}
                            {this.props.message.user._id === this.props.user._id &&!this.props.message.isLoading && this.props.message.isError &&<>
                            <ActionMenu actions={[
                                {text: 'Retry', action: () => {
                                    this.props.retrySendMessage(this.props.message)
                                }},
                                {text: 'Delete', action: () => {
                                    this.props.deleteLocalMessage(this.props.message._id)
                                }},
                            ]} from={'message-error-actions-'+this.state.randomId} />
                            <ErrorOutlineIcon className='error' id={'message-error-actions-'+this.state.randomId} style={{color: '#FF3333'}} />
                        </>}
                    </CSSTransitionGroup>
                </div>}
            </div>
        </>)
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        rooms: state.rooms
    }
}


export default connect(mapStateToProps)(Message)