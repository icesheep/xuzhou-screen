import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

import Routers from './routes';
import './index.css';

const render = Component => {
  ReactDOM.render(
        <Component />,
    document.getElementById('root')
  );
};

render(Routers);
