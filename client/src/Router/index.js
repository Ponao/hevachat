// App
import React from "react";
import { withCookies } from "react-cookie";
import SocketController from '../Controllers/SocketController'

// Router
import { Switch, Route, Redirect, withRouter } from "react-router-dom";
import routes from './config'

// Redux
import { connect } from "react-redux";
import * as userActions from "../Redux/actions/user";
import { bindActionCreators } from "redux";

import NoMatch from '../Pages/NoMatch'

function setTitle(path, routeArray) {
	var pageTitle;
	for (var i=0; i < routeArray.length; i++) {
		if (routeArray[i].path === path) {
			pageTitle = 'Hevachat | ' + routeArray[i].title;
		}
	}
	document.title = (pageTitle) ? pageTitle : 'Hevachat';
}

class AppRouter extends React.Component {
  state = {
    isRender: false
  }

  componentWillMount() {
      this.props.history.listen(() => {
          setTitle(this.props.history.location.pathname, routes);
      });
  }

  componentDidMount() {
    setTitle(this.props.history.location.pathname, routes);
    
    const { cookies } = this.props;
    let apiToken = cookies.get("apiToken");

    if (apiToken) {
      fetch(`http://localhost:8000/api/user/me`, {
        method: "get",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
      })
        .then((response) => response.json())
        .then((user) => {
          SocketController.init(apiToken)
          this.props.userActions.loginUser(user, apiToken);
          this.setState({isRender: true})
        });
    } else {
      this.setState({isRender: true})
    }
  }

  render() {
    return this.state.isRender && (
      <Switch>
          {routes.map((route, index) => {
              switch (route.type) {
                  case 'auth':
                      return <this.AuthRoute
                          key={index}
                          path={route.path}
                          exact={route.exact}
                      >
                          <route.component />
                      </this.AuthRoute>

                  case 'user':
                      return <this.PrivateRoute
                          key={index}
                          path={route.path}
                          exact={route.exact}
                      >
                          <route.component />
                      </this.PrivateRoute>
              
                  default:
                      return false
              }            
          })}

          {/* Auth routes */}
          {/* <this.AuthRoute exact path="/reset/:token" component={Reset}/> */}
          {/* Auth routes end */}

          <Route component={NoMatch} />
      </Switch>
    );
  }

  PrivateRoute = ({ children, ...rest }) => {
    return (
      <Route
        {...rest}
        render={() =>
          this.props.user.isAuth ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/login",
              }}
            />
          )
        }
      />
    );
  };

  AuthRoute = ({ children, ...rest }) => {
    return (
      <Route
        {...rest}
        render={() =>
          !this.props.user.isAuth ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/",
              }}
            />
          )
        }
      />
    );
  };
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    userActions: bindActionCreators(userActions, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withCookies(withRouter(AppRouter)));
