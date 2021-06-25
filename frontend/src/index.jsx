import React from 'react';
import ReactDOM from 'react-dom';

import App from './app';
import { setAuthorizationToken } from './utils';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.min';
import 'bootstrap/dist/js/bootstrap.min';

import './css/index.css';
import './css/buttons.css';

setAuthorizationToken(localStorage.getItem('access_token'));

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
