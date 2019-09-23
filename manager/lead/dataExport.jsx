import React from 'react';
import constant from 'manager/constant';
import DatePicker from 'react-datepicker';
import moment from 'moment-timezone';

import 'react-datepicker/dist/react-datepicker.css';

export default class DataExport extends React.Component {
  constructor() {
    super();
    this.state = {
      startDate: (moment().subtract(7, 'days').toDate()),
      endDate: (moment().subtract(1, 'days').toDate()),
    };
  }

  static getTitle() {
    return 'Data Export';
  }

  handleChange(name) {
    return (date) => {
      this.setState((state) => {
        let new_state = {...state, [name]: date};
        // validate
        if (moment(new_state.endDate).isBefore(new_state.startDate)) {
          if (name == 'startDate') {
            new_state.endDate = date;
          } else {
            new_state.startDate = date;
          }
        }

        return new_state;
      });
    };
  }

  render() {
    return (
      <div>
        <form
          className="form form-inline"
          action={`${constant.HEROKU_APP_URL}/data_export`}
          method="GET">
          <input type="hidden" name="access_token" value={this.props.accessToken} />
          From: &nbsp;
          <DatePicker
          dateFormat="yyyy/MM/dd"
          name="startDate"
          selectsStart={true}
          selected={this.state.startDate}
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          onChange={this.handleChange('startDate')} />
          &nbsp;

          To: &nbsp;
          <DatePicker
          dateFormat="yyyy/MM/dd"
          name="endDate"
          selected={this.state.endDate}
          selectsEnd={true}
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          onChange={this.handleChange('endDate')} />
          &nbsp;

          <input type="submit" className="btn btn-primary" value="Export" />

        </form>
      </div>
    );
  }
}
