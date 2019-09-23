import request from 'request-promise';
import React from 'react';
import {toast} from 'react-toastify';

import constant from 'manager/constant';
import Link from 'manager/components/Link.jsx';

export default class ManageLeads extends React.Component {
  constructor() {
    super();
    this.state = {
      keys: [],
      currentKey: '',
      inspectData: '',
    };
  }

  static getTitle() {
    return 'Manage Leads';
  }

  componentDidMount() {
    this.loadKeys();
  }

  loadKeys() {
    return request.get({
      uri: `${constant.HEROKU_APP_URL}/lead_scan_keys`,
      qs: {
        access_token: this.props.accessToken,
      },
    })
    .then((data) => {
      let keys = JSON.parse(data);
      let currentKey = keys[0] || '';
      this.setState({ 
        keys: keys,
        currentKey: currentKey,
      });
    });
  }

  inspectData() {
    request.get({
      uri: `${constant.HEROKU_APP_URL}/lead_with_key`,
      qs: {
        key: this.state.currentKey,
        access_token: this.props.accessToken,
      },
    })
    .then((data) => {
      let obj = JSON.parse(data);
      let inspectData = JSON.stringify(obj, null, 2);
      this.setState({ inspectData: inspectData });
    });
  }

  delLead() {
    request.del({
      uri: `${constant.HEROKU_APP_URL}/lead_with_key`,
      qs: {
        key: this.state.currentKey,
        access_token: this.props.accessToken,
      },
    })
    .then(() => {
      toast.info(`Lead(${this.state.currentKey}) deleted.`);
      this.setState({ 
        currentKey: null,
        inspectData: '',
      });
      return this.loadKeys();
    });
  }

  render() {
    return (
      <div>
        <form className="form form-inline">
          User: &nbsp;
          <select className="form-control" 
            value={this.state.currentKey}
            onChange={(event) => { this.setState({ currentKey: event.target.value }); }}>
            {this.state.keys.map((key) => { 
              return <option key={key} value={key}>{key}</option>;
            })}
          </select>&nbsp;
          <Link className="btn btn-primary" onClick={this.inspectData.bind(this)}>Inspect</Link>&nbsp;
          <Link className="btn btn-primary" onClick={this.delLead.bind(this)}>Delete</Link>&nbsp;
        </form>
        <textarea className="form-control" 
          rows={5}
          value={this.state.inspectData}
          onChange={(event) => { this.setState({ inspectData: event.target.value }); }}></textarea>
      </div>
    );
  }
}
