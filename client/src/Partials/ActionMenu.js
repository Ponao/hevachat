import React from 'react'

// Material
import Button from '@material-ui/core/Button';

// Icons


class ActionMenu extends React.Component {
    state = {
        active: false,
        left: 0,
        top: 0
    }

    toggleActive() {
        let element = document.getElementById(this.props.from)
        let rect = element.getBoundingClientRect()

        let top
        let left
        if(this.props.bottom) {
            top = rect.y + element.clientHeight
            left = rect.x
        }
        else {
            top = rect.y
            left = rect.x+element.clientWidth
        }
        
        this.setState({left, top})
        this.setState({active: !this.state.active})
    }

    componentDidMount() {
        document.getElementById(this.props.from).addEventListener('mouseenter', this.toggleActive.bind(this))
        document.getElementById(this.props.from).addEventListener('mouseleave', this.toggleActive.bind(this))
    }

    componentWillUnmount() {
        document.getElementById(this.props.from).removeEventListener('mouseenter', this.toggleActive.bind(this))
        document.getElementById(this.props.from).removeEventListener('mouseleave', this.toggleActive.bind(this))
    }

    render() {
        return (
            <div style={{left: this.state.left, top: this.state.top, transform: this.props.bottom ? 'none' : null}} className={`action-menu-container ${this.state.active ? 'active' : ''}`}>
                <div className={`action-menu`}>
                    {this.props.actions.map((action, index) => {
                        return action ? <Button key={index} onClick={() => {action.action()}} className="action-button">{action.text}</Button> : null
                    })}
                </div>
            </div>
        )
    }
}

export default ActionMenu