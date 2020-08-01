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

    toggleActive(e) {
        let element = document.getElementById(this.props.from)
        if(element) {
            let find = false
            let path = e.path || (e.composedPath && e.composedPath());
            if(path.find(x => x.id === this.props.from)) {
                e.stopPropagation()
                find = true
            }
            
            let rect = element.getBoundingClientRect()

            let top
            let left
            if(this.props.bottom) {
                top = rect.y + element.clientHeight
                left = rect.x
                if(this.props.right)
                    left = rect.x+element.clientWidth
            }
            else {
                top = rect.y
                left = rect.x+element.clientWidth
            }
            
            this.setState({left, top})
            if((this.props.event === 'click' && (this.state.active || find)) || this.props.event === 'hover')
                this.setState({active: !this.state.active})
        }
    }

    componentDidMount() {
        if(this.props.event === 'hover') {
            document.getElementById(this.props.from).addEventListener('mouseenter', this.toggleActive.bind(this))
            document.getElementById(this.props.from).addEventListener('mouseleave', this.toggleActive.bind(this))
        }
        if(this.props.event === 'click') {
            document.getElementById(this.props.from).addEventListener('click', this.toggleActive.bind(this))
            document.body.addEventListener('click', this.toggleActive.bind(this))
        }
    }

    componentWillUnmount() {
        if(this.props.event === 'hover') {
            document.getElementById(this.props.from).removeEventListener('mouseenter', this.toggleActive.bind(this))
            document.getElementById(this.props.from).removeEventListener('mouseleave', this.toggleActive.bind(this))
        }
        if(this.props.event === 'click') {
            document.getElementById(this.props.from).removeEventListener('click', this.toggleActive.bind(this))
            document.body.removeEventListener('click', this.toggleActive.bind(this))
        }
    }

    render() {
        return (
            <div style={{left: this.state.left, top: this.state.top, transform: this.props.bottom ? this.props.right ? 'translateX(-100%)' : 'none' : null}} className={`action-menu-container ${this.state.active ? 'active' : ''}`}>
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