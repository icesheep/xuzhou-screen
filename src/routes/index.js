import React, { Component } from 'react';
import { HashRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
// import AllComponents from '../pages/page';
import pagesConfig from './config';
import Bundle from './Bundle';
import App from '../App';

const routesConfig = pagesConfig.routes

export default class CRouter extends Component {
  render() {
    return (
      <Router forceRefresh={true}>
        <Route path="/" render={() =>
          <App>
            <Switch>
              {
                Object.keys(routesConfig).map(key =>
                  routesConfig[key].map(r => {
                    const route = r => {
                      if (r.component) {
                        // const Component = AllComponents[r.component];
                        const Component = props => <Bundle load={() => import('@/pages/'+r.component)}>{(D) => <D {...props}/>}</Bundle>;
                        return (
                          <Route key={r.route} path={ r.route} component={props => <Component {...props} />} />
                        )
                      }
                      return '';
                    }
                    return r.component ? route(r) : r.subs.map(r => route(r));
                  })
                )
              }
              <Redirect to={pagesConfig.redirect} />
            </Switch>
          </App>
        } />
      </Router>
    )
  }
}
