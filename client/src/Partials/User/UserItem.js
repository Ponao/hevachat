// App
import React from 'react'

import Avatar from '../User/Avatar'
import '../../Css/Partials/RoomItem.css'
import { withRouter } from 'react-router-dom';

// Material
import Button from '@material-ui/core/Button';
import { OnlineDate } from '../../Controllers/TimeController';
import { connect } from 'react-redux';


class UserItem extends React.Component {
    render() {
        return (
            <Button className={`user-item`} onClick={() => {
                this.props.history.push({
                    search: `?user=${this.props.user._id}`
                 })
            }}>
                <Avatar style={{width: 40, height: 40, fontSize: 14, fontWeight: 600, backgroundColor: `rgb(${this.props.user.color})`}} name={this.props.user.name.first.charAt(0) + this.props.user.name.last.charAt(0)} />

                <div>
                    <p className="user-name">{`${this.props.user.name.first} ${this.props.user.name.last}`}</p>
                    {!this.props.user.online && <p className="last-message">{OnlineDate(this.props.user.onlineAt)}</p>}
                    {this.props.user.online && <p className="last-message" style={{color: '#35E551'}}>online</p>}
                </div>
            </Button>
        )
    }
}

const mapStateToProps = state => {
    return {
        myUser: state.user,
    }
}

export default connect(mapStateToProps)(withRouter(UserItem))