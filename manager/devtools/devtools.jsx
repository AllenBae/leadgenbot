import React from 'react';

import { ToastContainer } from 'react-toastify';
import ServerConfig from './serverConfig.jsx';
import LeadInjector from './leadInjector.jsx';

export default class DevTools extends React.Component {

  constructor() {
    super();
  }

  static getID() {
    return 'devtools';
  }
  
  static getTitle() {
    return '#@ Dev Tools @#';
  }

  render() {
    return (
      <div>
        <div>
          <h4>{ServerConfig.getTitle()}</h4>
          <ServerConfig />
          <hr />
          <h4>{LeadInjector.getTitle()}</h4>
          <LeadInjector />
        </div>
        <ToastContainer autoClose={3000} />
      </div>
    );
  }
} 
