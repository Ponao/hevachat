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
import * as usersActions from "../Redux/actions/users";
import { bindActionCreators } from "redux";

import NoMatch from '../Pages/NoMatch'
import { setTitle } from "../Controllers/FunctionsController";
import {urlApi} from '../config'
import MainModal from "../Modals/MainModal";
import store from "../Redux/store";
import { BAN_SET } from "../Redux/constants";
import Ban from "../Pages/User/Ban";
class AppRouter extends React.Component {
  state = {
    isRender: false
  }

  componentDidMount() {
    this.props.history.listen(() => {
      setTitle(this.props.history.location.pathname, routes);
    });
    
    setTitle(this.props.history.location.pathname, routes);
    
    const { cookies } = this.props;
    let apiToken = cookies.get("apiToken");

    if (apiToken) {
      fetch(`${urlApi}/api/user/me`, {
        method: "get",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
      })
        .then((response) => response.json())
        .then(({user, dialogs, noReadCount, noReadNotifications, ban, numDate, date}) => {
          if(ban) {
            store.dispatch({
              type: BAN_SET,
              payload: {numDate, date}
            })
          } else {
            SocketController.init(apiToken)
            this.props.userActions.loginUser(user, dialogs, noReadCount, noReadNotifications, apiToken);
          }
          this.setState({isRender: true})
        })
        .catch(() => {
          localStorage.setItem('drafts', JSON.stringify([]));
          this.setState({isRender: true})
        })
    } else {
      localStorage.setItem('drafts', JSON.stringify([]));
      this.setState({isRender: true})
    }
  }

  render() {
    return this.state.isRender && (<>
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
                  case 'ban':
                    return this.props.ban.ban ? <Ban /> : <Redirect
                    to={{
                      pathname: "/",
                    }}
                  /> 

                  default:
                      return false
              }            
          })}

          {/* Auth routes */}
          {/* <this.AuthRoute exact path="/reset/:token" component={Reset}/> */}
          {/* Auth routes end */}

          <Route component={NoMatch} />
      </Switch></>
    );
  }

  PrivateRoute = ({ children, ...rest }) => {
    return (
      <Route
        {...rest}
        render={() =>
          this.props.user.isAuth ? this.props.ban.ban ? <Redirect
          to={{
            pathname: "/ban",
          }}
        /> : (
            (<>
              {children}
              <MainModal />
            </>)
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
          !this.props.user.isAuth ?  this.props.ban.ban ? <Redirect
          to={{
            pathname: "/ban",
          }}
        /> : (
            children
          )  : (
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
    ban: state.ban
  };
};

function mapDispatchToProps(dispatch) {
  return {
    userActions: bindActionCreators(userActions, dispatch),
    usersActions: bindActionCreators(usersActions, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withCookies(withRouter(AppRouter)));
