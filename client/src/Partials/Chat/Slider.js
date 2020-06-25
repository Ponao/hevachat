// App
import React from 'react'
import Modal from 'react-modal';

import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import CloseIcon from '@material-ui/icons/Close';

import '../../Css/Partials/Slider.css'

const customStylesModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        zIndex: 4
    },
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        padding               : '0',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        background            : 'rgba(0, 0, 0, 0.5);',
        border                : 'none',
        width: '100%',
        height: '100vh'
    }
};


class Slider extends React.Component {
    state = {
        index: this.props.index
    }

    render() {
        return <Modal
            isOpen={true}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModal}
            contentLabel="Slider"
        >
            <div className="slider-close" onClick={() => {
                this.props.close()
            }}>
                <CloseIcon style={{color: '#fff', fontSize: 30, opacity: 0.5}} />
            </div>

            {this.props.images[this.state.index-1] && <div className="slider-prev" onClick={() => {
                this.setState({index: this.state.index-1})
            }}>
                <NavigateBeforeIcon style={{color: '#fff', fontSize: 45, opacity: 0.5}} />
            </div>}

            <div className="slider-image-container" onClick={() => {this.props.close()}}>
                <img className="slider-image" src={this.props.images[this.state.index].path} alt="Media from user" />
            </div>

            {this.props.images[this.state.index+1] && <div className="slider-next" onClick={() => {
                this.setState({index: this.state.index+1})
            }}>
                <NavigateNextIcon style={{color: '#fff', fontSize: 45, opacity: 0.5}} />
            </div>}
        </Modal>
    }
}

export default Slider