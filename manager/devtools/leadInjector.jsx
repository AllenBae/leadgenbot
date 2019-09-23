import request from 'request-promise';
import React from 'react';
import {toast} from 'react-toastify';

import constant from 'common/constant';
import Link from 'manager/components/Link.jsx';

export default class LeadInjector extends React.Component {
  constructor() {
    super();
    this.state = {
      keys: [],
      currentKey: '',
      inspectData: '',
    };
  }

  static getTitle() {
    return 'Lead Injection';
  }

  componentDidMount() {
    this.loadKeys();
  }

  loadKeys() {
    return request.get({
      uri: `${constant.HEROKU_APP_URL}/dev/lead_scan_keys`,
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
      uri: `${constant.HEROKU_APP_URL}/dev/lead_with_key`,
      qs: {
        key: this.state.currentKey,
      },
    })
    .then((data) => {
      let obj = JSON.parse(data);
      let inspectData = JSON.stringify(obj, null, 2);
      this.setState({ inspectData: inspectData });
    });
  }

  injectLeadData() {
    let leadObj = null;
    try {
      leadObj = JSON.parse(this.state.inspectData);
    } catch (e) {
      toast.error('Oops, lead content is invalid JSON.');
      return;
    }
    request.post({
      uri: `${constant.HEROKU_APP_URL}/dev/lead_with_key`,
      json: leadObj,
    })
    .then(() => {
      toast.info(`Lead is injected for ${this.state.currentKey}.`);
    });
  }

  delLead() {
    request.del({
      uri: `${constant.HEROKU_APP_URL}/dev/lead_with_key`,
      qs: {
        key: this.state.currentKey,
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
          <Link className="btn btn-primary" onClick={this.injectLeadData.bind(this)}>Inject</Link>&nbsp;
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
