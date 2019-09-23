import React from 'react';
import Modal from 'react-responsive-modal';

import constant from './constant';
import {default as projectConstant} from 'common/constant';

export default class AccessTokenChecker extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      expired: false,
    };
    this.checkerId = null;
  }

  componentDidMount() {
    const request = this.props.requestPromise;
    // liyuhk: we check access token in first 1/2 of TTL, then 1/4 of TTL,
    // then 1/8 of TTL, ... finally every 2 seconds
    let checkingInterval = (projectConstant.ACCESS_TOKEN_TTL * 1000) / 2;
    const checkerFn = () => {
      request.get({
        uri: `${constant.HEROKU_APP_URL}/accesstoken/ping`
      })
      .then(() => {
        // passed, reset next check
        checkingInterval = (checkingInterval / 2) < 2000 ? 2000 : (checkingInterval / 2);
        this.checkerId = setTimeout(checkerFn, checkingInterval);
      })
      .catch(() => {
        this.setState({expired: true});
      });
    };
    this.checkerId = setTimeout(checkerFn, checkingInterval);
  }

  componentWillUpdate(_nextProps, nextState) {
    if (nextState.expired) {
      this.cleanupChecker();
    }
    return true;
  }

  componentWillUnmount() {
    this.cleanupChecker();
  }

  cleanupChecker() {
    if (this.checkerId) {
      clearTimeout(this.checkerId);
    }
  }

  render() {
    return this.state.expired
      ? (
        <Modal open={true}
               closeOnEsc={false}
               closeOnOverlayClick={false}
               showCloseIcon={false}
               little={true}
               style={{zIndex: '9999'}}>
          <h4>Your session has expired!</h4>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => { window.location.reload(); }}>
            Refresh Page Now!
          </button>
        </Modal>
      )
      : (<div></div>);
  }
}
