import request from 'request-promise';
import React from 'react';

import constant from 'manager/constant';

export default class ParametricCode extends React.Component {
  constructor() {
    super();
    this.state = {
      uri: null,
    };
  }

  static getTitle() {
    return 'Parametric Code of This Bot';
  }

  componentDidMount() {
    this.loadParametricCodeUrl();
  }

  loadParametricCodeUrl() {
    return request.get({
      uri: `${constant.HEROKU_APP_URL}/parametric_code`,
      qs: {
        access_token: this.props.accessToken,
      },
    })
    .then((data) => {
      const dataobj = JSON.parse(data);
      this.setState({uri: dataobj.uri});
    });
  }

  render() {
    return (
      <div>
        {this.state.uri
          ? <img src={this.state.uri} width="500"></img>
          : ''}
      </div>
    );
  }
}
