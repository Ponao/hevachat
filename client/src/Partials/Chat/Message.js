// App
import React from 'react'
import Avatar from '../User/Avatar'
import { getHM, timeAt } from '../../Controllers/TimeController'
import {CSSTransitionGroup} from 'react-transition-group'
import MessageComponent from './Message'

// Material
import CheckIcon from '@material-ui/icons/Check';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

import Linkify from 'react-linkify'

// Redux
import { connect } from 'react-redux'

const componentDecorator = (href, text, key) => (
    <a href={href} onClick={(e) => {e.stopPropagation()}} key={key} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
);

class Message extends React.Component {
    render() {
        let isHistoryDate = true
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
        }
        

        let isFirst = (
            (this.props.messages[this.props.index-1] && 
            this.props.messages[this.props.index-1].user._id !== this.props.message.user._id) || 
            !this.props.messages[this.props.index-1]
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
                    background: (this.props.message.isLoading || this.props.message.isError) ? (this.props.message.user._id !== this.props.user._id && !this.props.message.isRead) ? '#EFF4F8' : '#fff' : '', 
                    cursor: (this.props.message.isLoading || this.props.message.isError) ? 'default' : ''
                }}
            >
                {
                    (isFirst || isHistoryDate) && 
                    <Avatar style={{width: 32, height: 32}} name={this.props.message.user.name.first.charAt(0)+this.props.message.user.name.last.charAt(0)} />
                }

                {
                    (!isFirst && !isHistoryDate) &&
                    <div style={{width: 46}} />
                }

                {(!this.props.message.isLoading && !this.props.message.isError) && this.props.canSelect && <span style={{display: this.props.selected ? "block" : 'none'}} className={`select-indicator ${this.props.selected ? 'active' : ''}`}>
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
                            .replace(/&lt;/g, '<')}
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
                                return <div key={index} className="image" style={{width}} onClick={(e) => {
                                    e.stopPropagation()
                                    this.props.openSlider(images)
                                }}>
                                    <div className="image-blur">
                                        <span>{`+${images.length-3}`}</span>
                                        <img key={index} src={image} alt={`From user`} />
                                    </div>
                                </div>

                            return  <div key={index} className="image" style={{width}}>
                                <img src={image} alt={`From user`} />
                            </div>
                        })}
                    </div>}

                    {!!this.props.message.recentMessages.length && this.props.countRecent < 2 && <div className="message-recent">
                        {this.props.message.recentMessages.map((message, index, messages) => {
                            return <MessageComponent countRecent={this.props.countRecent+1} isRecent={true} onSelect={() => {}} openSlider={(sliderImages) => {this.props.openSlider(sliderImages)}} key={index} message={message} messages={messages} index={index} />
                        })}
                    </div>}
                </div>
                
                {!this.props.isRecent && <div className="message-status">
                    <CSSTransitionGroup 
                        transitionName="message-status-transition"
                        transitionEnterTimeout={100}
                        transitionLeaveTimeout={1}>
                        {this.props.message.user._id === this.props.user._id && this.props.message.isLoading && <QueryBuilderIcon style={{color: '#B8C3CF'}} />}
                        {!this.props.message.isLoading && !this.props.message.isError && this.props.message.isEdit && <EditOutlinedIcon style={{color: '#B8C3CF'}} />}
                        {this.props.message.user._id === this.props.user._id && !this.props.message.isLoading && !this.props.message.isError && !this.props.message.isRead && <DoneIcon style={{color: '#B8C3CF'}} />}
                        {this.props.message.user._id === this.props.user._id &&!this.props.message.isLoading && !this.props.message.isError && this.props.message.isRead && <DoneAllIcon style={{color: '#008FF7'}} />}
                        {this.props.message.user._id === this.props.user._id &&!this.props.message.isLoading && this.props.message.isError && <ErrorOutlineIcon style={{color: '#FF3333'}} />}
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