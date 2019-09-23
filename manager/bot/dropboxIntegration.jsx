import React from 'react';
import {ToastContainer, toast} from 'react-toastify';

import constant from 'manager/constant';
import Folderable from 'manager/components/Folderable.jsx';
import Link from 'manager/components/Link.jsx';

export default class DropboxIntegration extends React.Component {
  constructor() {
    super();
    this.state = {
      appKey: null,
      newAppKey: '',
    };
  }

  static getTitle() {
    return 'Dropbox Integration';
  }

  componentDidMount() {
    this.loadDropboxAppKey();
  }

  loadDropboxAppKey() {
    const request = this.props.requestPromise;
    request.get({
      uri: `${constant.HEROKU_APP_URL}/dropbox/app_key`,
    })
    .then((data) => {
      this.setState({appKey: data});
    })
    .catch((err) => {
      console.error(`load dropbox app_key failed with ${JSON.stringify(err)}`);
      this.setState({appKey: null});
    });
  }

  setupDropboxAppKey() {
    const request = this.props.requestPromise;
    const newAppKey = this.state.newAppKey;
    request.post({
      uri: `${constant.HEROKU_APP_URL}/dropbox/app_key`,
      json: {
        key: newAppKey,
      },
    })
    .then(() => {
      this.setState({appKey: newAppKey, newAppKey: ''});
    })
    .catch((err) => {
      console.error(`Save dropbox app key failed with ${JSON.stringify(err)}`);
      toast.error('Save dropbox app key failed!');
    });
  }

  onChangeAppKeyInput(event) {
    this.setState({newAppKey: event.target.value});
  }

  renderHowToSetupDropboxApp() {
    return (
      <ol>
        <li>
          Go to dropbox <a href="https://www.dropbox.com/developers/apps/create" target="_blank">
          `create app`</a> page, create one app for using with this bot.
        </li>
        <li>
          Go to your app settings, in section 'Chooser/Saver domains', add this bot's domain
          &nbsp;<code>{window.location.hostname}</code>.
        </li>
        <li>
          In the same page of your app settings, in section 'App key', find your app key
          to use in next step.
        </li>
      </ol>
    );
  }

  renderConfiguredDropboxAppKey() {
    return this.state.appKey
    ? (
      <div className="alert alert-success">
        Configured Dropbox App Key is: <b>{this.state.appKey}</b>
      </div>
    )
    : '';
  }

  rednerDropboxAppKeySetup() {
    const setupForm = (
      <form className="form form-inline">
        Dropbox AppKey: &nbsp;
        <input className="form-control"
              type="text"
              placeholder="dropbox appkey here..."
              required={true}
              value={this.state.newAppKey || this.state.appKey}
              onChange={(event) => { this.setState({newAppKey: event.target.value}); }} /> &nbsp;
        <Link className="btn btn-primary"
              onClick={this.setupDropboxAppKey.bind(this)}>
          Save
        </Link>
        <ToastContainer autoClose={3000} />
      </form>
    );
    if (this.state.appKey) {
      return (
        <Folderable isFold={true}
                    folddedLabel={'Change to another Dropbox App Key'}
                    expandedLabel={'Close and keep my setup'}>
          {setupForm}
        </Folderable>
      );
    } else {
      return setupForm;
    }
  }

  render() {
    return (
      <div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Step 1: Create or Setup Dropbox App correctly</h5>
            {this.renderHowToSetupDropboxApp()}
          </div>
        </div>
        <br/>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Step 2: Configure Dropbox App Key and Secret</h5>
            {this.renderConfiguredDropboxAppKey()}
            {this.rednerDropboxAppKeySetup()}
          </div>
        </div>
      </div>
    );
  }
}
