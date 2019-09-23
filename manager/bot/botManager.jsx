import React from 'react';

import {ToastContainer} from 'react-toastify';
import ParametricCode from './parametricCode.jsx';
import Permission from './permission.jsx';
import DropboxIntegration from './dropboxIntegration.jsx';

export default class BotManager extends React.Component {

  constructor() {
    super();
  }

  static getID() {
    return 'bot_manager';
  }

  static getTitle() { 
    return 'Manage This Bot';
  }

  render() {
    return (
      <div>
        <div>
          <h4>{ParametricCode.getTitle()}</h4>
          <ParametricCode {...this.props}/>
          <hr />
          <h4>{Permission.getTitle()}</h4>
          <Permission {...this.props}/>
          <hr />
          <h4>{DropboxIntegration.getTitle()}</h4>
          <DropboxIntegration {...this.props} />
        </div>
        <ToastContainer autoClose={3000} />
      </div>
    );
  }
} 
