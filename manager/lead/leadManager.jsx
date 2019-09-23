import React from 'react';

import { ToastContainer } from 'react-toastify';
import DownloadLeads from './downloadLeads.jsx';
import DataExport from './dataExport.jsx';
import ManageLeads from './manageLeads.jsx';

export default class LeadManager extends React.Component {

  constructor() {
    super();
  }

  static getID() {
    return 'leads_manager';
  }

  static getTitle() {
    return 'Manage Leads';
  }

  render() {
    return (
      <div>
        <div>
          <h4>{DownloadLeads.getTitle()}</h4>
          <DownloadLeads {...this.props}/>
          <hr/>

          <h4>{DataExport.getTitle()}</h4>
          <DataExport {...this.props}/>
          <hr/>

          <h4>{ManageLeads.getTitle()}</h4>
          <ManageLeads {...this.props}/>
        </div>
        <ToastContainer autoClose={3000} />
      </div>
    );
  }
} 
