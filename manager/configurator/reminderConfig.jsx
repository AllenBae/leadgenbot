import React from 'react';
import {ToastContainer, toast} from 'react-toastify';

import constant from 'manager/constant';
import Link from 'manager/components/Link.jsx';

import immutable from 'object-path-immutable';

export default class ReminderConfig extends React.Component {
  constructor() {
    super();
    this.state = {
      reminder_text: null
    };
  }

  static getTitle() {
    return 'Reminder Settings';
  }

  componentDidMount() {
    let request = this.props.requestPromise;
    request.get({
      uri: `${constant.HEROKU_APP_URL}/bot_settings`,
    })
    .then((body) => {
      toast.success('Settings been loaded from Facebook.');
      let settings = JSON.parse(body);
      console.log(settings);
      this.setState(settings);
    })
    .catch((err) => {
      console.error(err);
      toast.error('Oops, can not load welcome screen from Facebook.');
    });
  }

  onChangeAttr(attr) {
    return (event) => {
      let new_config = immutable.set(
        this.state,
        attr,
        event.target.value,
      );
      this.setState(new_config);
    };
  }

  saveSettings(_event) {
    let request = this.props.requestPromise;
    request.post({
      uri: `${constant.HEROKU_APP_URL}/bot_settings`,
      json: this.state,
    })
    .then(() => {
      toast.success('Settings has been saved!');
    })
    .catch((err) => {
      console.error(err);
      toast.error('Oops, saving welcome screen text failed!');
    });
  }

  render() {
    return (
      <form>
        <div className="form-group row">
          <div className="col-sm-9">
            <label className="col-sm-3 col-form-label">Reminder Text</label>
            <input type="text"
              className="form-control"
              value={this.state.reminder_text}
              onChange={this.onChangeAttr('reminder_text')}
            />
          </div>
        </div>
        <Link className="btn btn-primary" onClick={this.saveSettings.bind(this)}>Save</Link>
        <ToastContainer autoClose={3000} />
      </form>
    );
  }
}
