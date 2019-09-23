import request from 'request-promise';
import React from 'react';
import {toast} from 'react-toastify';

import constant from 'manager/constant';
import Link from 'manager/components/Link.jsx';

export default class Permission extends React.Component {
  constructor() {
    super();
    this.state = {
      emails: [],
      currentEmail: '',
      newAdminEmail: '',
    };
  }

  static getTitle() {
    return 'Manage Permisssion';
  }

  componentDidMount() {
    this.loadAuthorizedEmails();
  }

  loadAuthorizedEmails() {
    return request.get({
      uri: `${constant.HEROKU_APP_URL}/permission`,
      qs: {
        access_token: this.props.accessToken,
      },
    })
    .then((data) => {
      let emails = JSON.parse(data);
      let currentEmail = emails[0] || '';
      this.setState({ 
        emails: emails,
        currentEmail: currentEmail,
      });
    });
  }

  addEmail() {
    request.post({
      uri: `${constant.HEROKU_APP_URL}/permission/add`,
      json: {
        email: this.state.newAdminEmail,
        access_token: this.props.accessToken,
      },
    })
    .then(() => {
      toast.info(`Authorized email(${this.state.newAdminEmail}).`);
      this.setState({ 
        newAdminEmail: '',
      });
      return this.loadAuthorizedEmails();
    });
  }

  delEmail() {
    request.post({
      uri: `${constant.HEROKU_APP_URL}/permission/del`,
      json: {
        email: this.state.currentEmail,
        access_token: this.props.accessToken,
      },
    })
    .then(() => {
      toast.info(`Authorized email(${this.state.currentEmail}) deleted.`);
      this.setState({ 
        currentEmail: null,
      });
      return this.loadAuthorizedEmails();
    });
  }

  render() {
    return (
      <div>
        <form className="form form-inline">
          <div>
            New Admin Email: &nbsp;
            <input className="form-control" 
              value={this.state.newAdminEmail} 
              placeholder="new admin email..." 
              onChange={(event) => {
                this.setState({ newAdminEmail: event.target.value });
              }} /> &nbsp;
            <Link className="btn btn-primary" onClick={this.addEmail.bind(this)}>Authorize</Link>&nbsp;
          </div>
        </form>
        <form className="form form-inline">
          <div>
            Authorized Admin Emails: &nbsp;
            <select className="form-control" 
              value={this.state.currentEmail}
              onChange={(event) => { this.setState({ currentEmail: event.target.value }); }}>
              {this.state.emails.map((email) => { 
                return <option key={email} value={email}>{email}</option>;
              })}
            </select>&nbsp;
            <Link className="btn btn-secondary" onClick={this.delEmail.bind(this)}>Remove</Link>&nbsp;
          </div>
        </form>
      </div>
    );
  }
}
