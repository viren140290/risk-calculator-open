import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'core-js/features/string/repeat';
import 'core-js/features/string/';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './bootstrap-overrides.scss'
import App from './components/App/App';
import {IntlProvider} from 'react-intl';
import reportWebVitals from './reportWebVitals';
import en from './lang/en.json';

/* istanbul ignore file */
ReactDOM.render(
    <IntlProvider locale="en" messages={en}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </IntlProvider>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
