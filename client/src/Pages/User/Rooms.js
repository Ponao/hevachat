// App
import React from 'react'
import {PageSettings} from '../PageSettings'

// Modal
import ModalCreateRoom from '../../Modals/CreateRoom'

// Redux
import { connect } from 'react-redux'

class Rooms extends React.Component {
    static contextType = PageSettings;

    state = {
        isOpenCreateRoom: false
    }

    componentDidMount() {
        this.context.toggleHeader(true)

        fetch(`http://localhost:8000/api/room/get-all`, {
            method: "get",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
        })
        .then((response) => response.json())
        .then((rooms) => {
            console.log(rooms)
        });
    }

    componentWillUnmount() {
        this.context.toggleHeader(false)
    }

    render() {
        return (
            <>
                <ModalCreateRoom isOpen={this.state.isOpenCreateRoom} close={() => {this.setState({isOpenCreateRoom: false})}} />

                <div className="col-md-9"></div>
                <div className="col-md-3 sidebar">
                    <h2 className="sidebar-title">Rooms<span onClick={() => {this.setState({isOpenCreateRoom: true})}}>SD</span></h2>

                </div>
                <div className="col-md-9">
                    CONTENT
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Rooms)