// App
import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars';

// Material
import GroupIcon from '@material-ui/icons/Group';

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../../Redux/actions/users'
import { bindActionCreators } from 'redux'

import { withRouter } from 'react-router-dom';
import UserItem from '../../Partials/User/UserItem';
import { CircularProgress } from '@material-ui/core';
import { urlApi } from '../../config';
import languages from '../../languages';
import { withLang } from 'react-multi-language';

let waitSearch = false

class Contacts extends React.Component {
    state = {
        q: '',
        searchResult: []
    }

    componentDidMount() {
        if(!this.props.users.friends.getted) {
            this.props.usersActions.friendsGet(this.props.user.apiToken)
        }
    }

    onScroll() {

    }

    onSearch(e) {
        let q = e.target.value
        this.setState({q})

        if(waitSearch)
            clearTimeout(waitSearch)

        if(!!q.length && /\S/.test(q)) {
            waitSearch = setTimeout(() => {
                fetch(`${urlApi}/api/user/search`, {
                    method: "post",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.props.user.apiToken}`,
                    },
                    body: JSON.stringify({
                        q: this.state.q
                    })
                })
                .then(response => response.json())
                .then(searchResult => {
                    this.setState({searchResult})
                })
            }, 500);
        }

        if(!q.length)
            this.setState({searchResult: []})
    }
    
    render() {
        return <>
            <input type="text" value={this.state.q} onChange={(e) => {this.onSearch(e)}} className="friends-search-input" placeholder={this.props.langProps.search} />

            {!this.state.searchResult.length && !this.state.q.length && <Scrollbars
                ref={(ref) => {this.roomsBlock = ref}}
                renderTrackVertical={props => <div className="track-vertical"/>}
                renderThumbVertical={props => <div className="thumb-vertical"/>}
                className="scroll"
                onScroll={() => {this.onScroll()}}
                style={{height: 340}}
                autoHide
            >
                {this.props.users.friends.isFetching && <CircularProgress style={{
                        color: '#008FF7',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        margin: 'auto',
                        top: 'calc(50% - 20px)'
                    }} />}
                {this.props.users.friends.users.map((user, index) => {
                    return (
                        <UserItem key={index} type={this.props.type} selected={this.props.type === 'select' ? !!this.props.selectUsers.find(x => x === user._id) : false} onClick={(id) => {this.props.onClick(id)}} user={user} />
                    )
                })}
                {(!this.props.users.friends.users.length && !this.props.users.friends.isFetching) && <div className="data-empty">
                    <GroupIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                    <p>{this.props.langProps.you_dont_have_friends}</p>
                </div>}
            </Scrollbars>}

            {(!!this.state.searchResult.length || !!this.state.q.length) && <Scrollbars
                ref={(ref) => {this.roomsBlock = ref}}
                renderTrackVertical={props => <div className="track-vertical"/>}
                renderThumbVertical={props => <div className="thumb-vertical"/>}
                className="scroll"
                onScroll={() => {this.onScroll()}}
                style={{height: 340}}
                autoHide
            >
                {/* {this.props.users.friends.isFetching && <CircularProgress style={{
                        color: '#008FF7',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        margin: 'auto',
                        top: 'calc(50% - 20px)'
                    }} />} */}
                {this.state.searchResult.map((user, index) => {
                    return (
                        <UserItem key={index} type={this.props.type} selected={this.props.type === 'select' ? !!this.props.selectUsers.find(x => x === user._id) : false} onClick={(id) => {this.props.onClick(id)}} user={user} />
                    )
                })}
                {(!this.state.searchResult.length) && <div className="data-empty">
                    <GroupIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                    <p>{this.props.langProps.users_not_found}</p>
                </div>}
            </Scrollbars>}
        </>
    }
}

const mapStateToProps = state => {
    return {
        users: state.users,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        usersActions: bindActionCreators(usersActions, dispatch),
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(Contacts)))