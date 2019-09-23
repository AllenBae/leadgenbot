import React from 'react';

import constant from 'manager/constant';

export default class DownloadLeads extends React.Component {

  static getTitle() {
    return 'Download Leads';
  }

  render() {
    return (
      <div>
        <a className="btn btn-primary" 
          href={`${constant.HEROKU_APP_URL}/download_leads?access_token=${this.props.accessToken}`}>
          Download Leads
        </a>
      </div>
    );
  }
}
