import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './manager.less';

import React from 'react';
import ReactDOM from 'react-dom';

import ensureLoggedInFacebook from './fblogin.jsx';
import withBurgerMenu from './menu.jsx';
import constant from './constant';
import DevManager from './devManager.jsx';
import ServerChannel from './serverChannel.jsx';
import AccessTokenChecker from './accessTokenChecker.jsx';

class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      page: null,
    };
    this.serverChannelRef = null;
  }

  notifySetupComplete(page) {
    this.setState({
      page: page,
    });
  }

  renderMainContent() {
    let WrappedContent = this.props.currentContentClass;
    return (
      <WrappedContent
        notifySetupComplete={this.notifySetupComplete.bind(this)}
        userAccessToken={this.props.userAccessToken}
        serverChannel={this.serverChannelRef}
        {...this.props}
      />
    );
  }

  render() {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col col-md-10">
            {this.renderMainContent()}
          </div>
        </div>
        <ServerChannel ref={c => this.serverChannelRef = c}/>
        <AccessTokenChecker {...this.props} />
      </div>
    );
  }
}

if (constant.DEV_MANAGER) {
  ReactDOM.render(<DevManager />, document.querySelector('#app'));
} else {
  const App = ensureLoggedInFacebook(withBurgerMenu(Manager));
  ReactDOM.render(<App />, document.querySelector('#app'));
}

