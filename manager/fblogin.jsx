import React from 'react';
import request from 'request-promise';

import constant from './constant';

function ensureAccessTokenInQs(options, access_token) {
  let new_options = Object.assign({}, options);
  if (new_options.qs) {
    new_options.qs = Object.assign({}, new_options.qs, { access_token: access_token });
  } else {
    new_options.qs = { access_token: access_token };
  }
  return new_options;
}

function ensureAccessTokenInRequest(access_token) {
  return {
    'get': (options, ...args) => {
      return request({ method: 'GET', ...ensureAccessTokenInQs(options, access_token) }, ...args);
    },
    'post': (options, ...args) => {
      return request({ method: 'POST', ...ensureAccessTokenInQs(options, access_token) }, ...args);
    },
    'put': (options, ...args) => {
      return request({ method: 'PUT', ...ensureAccessTokenInQs(options, access_token) }, ...args);
    },
    'del': (options, ...args) => {
      return request({ method: 'DEL', ...ensureAccessTokenInQs(options, access_token) }, ...args);
    },
  };
}

export default function ensureLoggedInFacebook(WrappedComponent) {
  return class extends React.Component {
    constructor() {
      super();
      this.state = {
        loggedin: false,
        userId: null,
        userEmail: null,
        userAccessToken: '',
        accessToken: '',
        requestPromise: undefined,
      };
    }

    fbLoginResponse(response) {
      /* eslint-disable */
      if (response.status == 'connected') {
        const user_access_token = response.authResponse.accessToken;
        const user_id = response.authResponse.userID;
        request.get({
          uri: `${constant.HEROKU_APP_URL}/auth/fbuser`,
          qs: {
            userid: user_id,
            accesstoken: user_access_token,
          },
        })
        .then((body) => {
          const bodyobj = JSON.parse(body);
          this.setState({
            loggedin: true,
            userId: user_id,
            userEmail: bodyobj.user_email,
            userName: bodyobj.user_name,
            userAccessToken: user_access_token,
            accessToken: bodyobj.access_token,
            requestPromise: ensureAccessTokenInRequest(bodyobj.access_token),
          });
        });
      } else {
        this.setState({ loggedin: false });
      }
      /* eslint-enable */
    }

    componentDidMount() {
      /* eslint-disable */
      let fbLoginResponse = this.fbLoginResponse.bind(this);
      window.fbAsyncInit = function() {
        FB.init({
          appId      : constant.FB_APP_ID,
          cookie     : true,
          xfbml      : true,
          version    : constant.FBSDK_VERSION
        });
        FB.getLoginStatus(fbLoginResponse);
        FB.Event.subscribe('auth.statusChange', fbLoginResponse);
      }.bind(this);

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = `//connect.facebook.net/en_US/sdk.js#xfbml=1&version=${constant.FBSDK_VERSION}&appId=${constant.FB_APP_ID}`;
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
      /* eslint-enable */
    }

    renderFbLogin() {
      return (
        <div className="container">
          <div className="row justify-content-center" style={{marginTop: '80px'}}>
            <p>Please login with Facebook to proceed</p>
            <div className="col col-md-10">
              <center>
                <div className="fb-login-button"
                  data-max-rows="1"
                  data-size="large"
                  data-button-type="login_with"
                  data-show-faces="false"
                  data-auto-logout-link="false"
                  data-use-continue-as="true"
                  data-scope="public_profile,email,manage_pages,pages_messaging">
                </div>
              </center>
            </div>
          </div>
        </div>
      );
    }

    render() {
      if (this.state.loggedin) {
        return <WrappedComponent {...this.props} {...this.state} />;
      } else {
        return this.renderFbLogin();
      }
    }
  };
}
