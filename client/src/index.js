// App
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/ie11';
import 'core-js/features/array/find';
import 'core-js/features/array/includes';
import 'core-js/features/number/is-nan';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { CookiesProvider } from 'react-cookie'
import {
    BrowserRouter as Router,
} from "react-router-dom"
import Modal from "react-modal";
import { ToastContainer } from 'react-toastify';


// Redux
import store from './Redux/store'
import { Provider } from 'react-redux'

Modal.setAppElement("#root");

ReactDOM.render(
    <CookiesProvider>
        <Provider store={store}>
            <Router>
                <App />
                <ToastContainer />
            </Router>
        </Provider>
    </CookiesProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
