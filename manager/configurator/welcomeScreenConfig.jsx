import React from 'react';
import {ToastContainer, toast} from 'react-toastify';

import constant from 'manager/constant';
import Link from 'manager/components/Link.jsx';

export default class WelcomeScreenConfig extends React.Component {
  constructor() {
    super();
    this.state = {
      greetingText: 'Welcome to <your bot name> managed by leadgen bot template!',
    };
  }

  static getTitle() {
    return 'Manage Welcome';
  }

  componentDidMount() {
    let request = this.props.requestPromise;
    request.get({
      uri: `${constant.HEROKU_APP_URL}/welcome_screen`,
    })
    .then((body) => {
      toast.success('Welcome screen text has been loaded from Facebook.');
      this.setState({ greetingText: body });
    })
    .catch((err) => {
      console.error(err);
      toast.error('Oops, can not load welcome screen from Facebook.');
    });
  }

  changeGreetingText(event) {
    this.setState({ greetingText: event.target.value });
  }

  saveGreetingText(_event) {
    let request = this.props.requestPromise;
    request.post({
      uri: `${constant.HEROKU_APP_URL}/welcome_screen`,
      json: {
        text: this.state.greetingText,
      },
    })
    .then(() => {
      toast.success('Welcome screen text has been saved!');
    })
    .catch((err) => {
      console.error(err);
      toast.error('Oops, saving welcome screen text failed!');
    });
  }

  render() {
    return (
      <form>
        <div className="form-group">
          <textarea
            className="form-control"
            rows="5"
            value={this.state.greetingText}
            onChange={this.changeGreetingText.bind(this)}>
          </textarea>
        </div>
        <Link className="btn btn-primary" onClick={this.saveGreetingText.bind(this)}>Save</Link>
        <ToastContainer autoClose={3000} />
      </form>
    );
  }
}
