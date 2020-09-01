// App
import React from 'react'

// Material
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import { randomInteger } from '../../Controllers/FunctionsController';

let audioDurationInterval = false

class Audio extends React.Component {
    state = {
        duration: '00:00',
        audio: false,
        randomId: randomInteger(0, 10000000)
    }

    componentDidMount() {
        let thisAudio = document.getElementsByName(this.props.src)

        for(let audio of thisAudio) {
            audio.volume = 0.5
            this.setState({audio})
            break
        }

        let audio = document.getElementById(this.state.randomId)

        audio.onpause = () => {
            audio.parentElement.className = 'message-sound'
        }

        audio.onplay = () => {
            audio.parentElement.className = 'message-sound active'
        }

        audio.onloadedmetadata = () => {
            this.getDuration()
        }
    }

    getDuration() {
        function padZero(v) {
            return (v < 10) ? "0" + v : v;
        }

        let thisAudio = document.getElementsByName(this.props.src)

        let t = 0

        for(let audio of thisAudio) {
            t = audio.duration
            break
        }

        this.setState({duration: padZero(parseInt((t / (60)))) + ":" + padZero(parseInt((t) % 60))})
    }

    componentWillUnmount() {
        if(audioDurationInterval)
            this.stopTimer()

        if(document.getElementsByName(this.props.src)) {
            document.getElementsByName(this.props.src).className = 'message-sound'
            this.state.audio.pause()
        }
    }

    playAudio(e) {
        e.stopPropagation()

        let otherAudio = document.getElementsByClassName('message-sounds-element')
        
        this.stopTimer()

        for (let audio of otherAudio) {
            audio.pause()
        }

        let thisAudio = document.getElementById(this.state.randomId)

        // for(let audio of thisAudio) {
            thisAudio.play()
        //     break
        // }

        this.startTimer()
    }

    changeDurationAudio(e) {
        e.stopPropagation()

        let position = e.nativeEvent.offsetX * 100 / this.rangeBlock.clientWidth
        let time = this.state.audio.duration / 100 * position
        console.log(e.nativeEvent)

        let thisAudio = document.getElementsByName(this.props.src)

        for(let audio of thisAudio) {
            audio.currentTime = time
        }

        let thisRange = document.getElementsByName(this.props.src+'-range')

        for(let range of thisRange) {
            range.style.width = (100*this.state.audio.currentTime/this.state.audio.duration)+'%'
        }
    }

    startTimer() {
        audioDurationInterval = setInterval(() => {
            let thisRange = document.getElementsByName(this.props.src+'-range')

            for(let range of thisRange) {
                range.style.width = (100*this.state.audio.currentTime/this.state.audio.duration)+'%'
            }
        }, 100)
    }

    stopTimer() {
        clearInterval(audioDurationInterval)
    }

    viewDurationAudio(e) {
        let position = e.nativeEvent.layerX * 100 / this.rangeBlock.clientWidth
        let time = this.state.audio.duration / 100 * position

        let thisRange = document.getElementsByName(this.props.src+'-range')

        for(let range of thisRange) {
            range.style.width = (100*time/this.state.audio.duration)+'%'
        }
    }

    stopAudio(e) {
        if(audioDurationInterval)
            this.stopTimer()

        e.stopPropagation()

        let thisAudio = document.getElementsByName(this.props.src)

        for(let audio of thisAudio) {
            audio.pause()
        }
    }

    render() {
        return <div className="message-sound">
            <audio className={`message-sounds-element`} id={this.state.randomId} name={this.props.src} src={this.props.src} />
            <span className="play" onClick={(e) => {this.playAudio(e)}}><PlayArrowIcon style={{color: '#008FF7'}} /></span>
            <span className="pause" onClick={(e) => {this.stopAudio(e)}}><PauseIcon style={{color: '#008FF7'}} /></span>
            <div className="message-sound-info">
                <p className="message-sounds-name">{this.props.fileName}</p>
                <p className="message-sounds-duration">{this.state.duration}</p>
            </div>

            <div className="message-sound-range" 
                ref={(ref) => {this.rangeBlock = ref}} 
                onMouseMove={(e) => {this.viewDurationAudio(e)}} 
                onMouseEnter={() => {this.stopTimer()}}
                onMouseLeave={() => {this.startTimer()}}
                onClick={(e) => {this.changeDurationAudio(e)}}
            >
                <span className="range-position" ref={(ref) => {this.range = ref}} name={this.props.src + '-range'}></span>
            </div>
        </div>
    }
}

export default Audio