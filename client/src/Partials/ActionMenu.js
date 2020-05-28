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
        
        this.setState({left: rect.x+element.clientWidth, top: rect.y})
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
            <div style={{left: this.state.left, top: this.state.top}} className={`action-menu-container ${this.state.active ? 'active' : ''}`}>
                <div className={`action-menu`}>
                    {this.props.actions.map((action, index) => {
                        return <Button key={index} onClick={() => {action.action()}} className="action-button">{action.text}</Button>
                    })}
                </div>
            </div>
        )
    }
}

export default ActionMenu