import request from 'request-promise';
import React from 'react';

import constant from 'manager/constant';

export default class ServerConfig extends React.Component {
  constructor() {
    super();
    this.state = {
      config: null,
    };
  }

  static getTitle() {
    return 'Server Config';
  }

  componentDidMount() {
    request.get({
      uri: `${constant.HEROKU_APP_URL}/dev/server_config`
    })
    .then((data) => {
      this.setState({ config: JSON.parse(data) });
    });
  }

  render() {
    return (
      <div>
        <pre>
        {JSON.stringify(this.state.config, null, 2)}
        </pre>
      </div>
    );
  }
}
