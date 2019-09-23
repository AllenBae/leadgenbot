import React from 'react';
import socketio from 'socket.io-client';

import constant from './constant';

export default class ServerChannel extends React.Component {

  constructor(props) {
    super(props);
    this.socket_client = null;
  }

  on(message, callback) {
    return this.socket_client.on(message, callback);
  }

  off(message, callback) {
    return this.socket_client.off(message, callback);
  }

  componentDidMount() {
    this.socket_client = socketio.connect(constant.HEROKU_APP_URL);
    this.socket_client.on('connect', (data) => {
      console.log('connected to server', data);
    });
  }

  render() {
    return (<div></div>);
  }
}
