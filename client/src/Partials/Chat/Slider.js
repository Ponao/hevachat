// App
import React from 'react'
import Modal from 'react-modal';
import { Carousel } from 'react-responsive-carousel';

import '../../Css/Partials/Slider.css'

const customStylesModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        zIndex: 2
    },
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        padding : '0',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        background            : 'rgba(0, 0, 0, 0.5);',
        border: 'none'
        // width: '100%',
        // height: '100%'
    }
};


class Slider extends React.Component {
    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModal}
            contentLabel="Slider"
        >
            <Carousel>
                {this.props.images.map((image, index) => {
                    return <div>
                        <img src={image} alt={`From user`} />
                    </div>
                })}
            </Carousel>
        </Modal>
    }
}

export default Slider