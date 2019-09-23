import React  from 'react';
import { ToastContainer, toast } from 'react-toastify';

import constant from 'manager/constant';
import BotConfigurator from 'manager/configurator/configurator.jsx';
import Folderable from 'manager/components/Folderable.jsx';

export default class PageSelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      pages: [],
      selectedPage: {
        access_token: '',
        name: 'Select Facebook Page',
        id: '',
      },
      subscribedPage: {
        name: null,
        id: null,
      },
    };
  }

  static getID() {
    return 'page_selector';
  }

  static getTitle() {
    return 'Connect Bot To Page';
  }

  setupBot(event) {
    event.preventDefault();
    const request = this.props.requestPromise;
    if (this.state.selectedPage.id) {
      request.post({
        uri: `${constant.HEROKU_APP_URL}/subscribe_page`,
        json: {
          page: this.state.selectedPage,
        },
      })
      .then(() => {
        return request.post({
          uri: `${constant.HEROKU_APP_URL}/access_token`,
          json: {
            access_token: this.props.userAccessToken,
            page_id: this.state.selectedPage.id,
          }
        });
      })
      .then(() => {
        this.props.notifySetupComplete({page: this.state.selectedPage});
        this.props.changeToMenu(BotConfigurator.getID());
        return null;
      })
      .catch((err) => {
        console.error(`Oops, setup bot failed with ${JSON.stringify(err)}`);
        toast.error('Oops, setup bot failed.');
      });
    } else {
      toast.error('Please select a Facebook Page!');
    }
  }

  renderPageSelectDropdownButton() {
    let allPageSelectItems = this.state.pages.map((page, _index) => {
      return <option key={page.id} value={page.id}>{page.name} ({page.id})</option>;
    });
    return (
      <select className="form-control" 
        style={{width: '25em'}} 
        value={this.state.selectedPage.id}
        onChange={this.onPageItemSelect.bind(this)}
        placeholder="Select your page ...">
        {allPageSelectItems}
      </select>
    );
  }

  onPageItemSelect(event) {
    let page = this.state.pages.find((page) => { 
      return page.id == event.target.value; 
    });
    this.setState({
      selectedPage: {
        access_token: page.access_token,
        name: page.name,
        id: page.id,
      }
    });
  }

  componentDidMount() {
    /* eslint-disable */
    FB.api('/me/accounts', (response) => {
      let pages = response.data;
      let selectedPage = pages[0] ? 
        {
          access_token: pages[0].access_token,
          name: pages[0].name,
          id: pages[0].id,
        } : {
          access_token: '',
          name: '',
          id: '',
        };
      this.setState({
        pages: pages,
        selectedPage: selectedPage,
      });
    });
    /* eslint-enable */

    const request = this.props.requestPromise;
    request.get({
      uri: `${constant.HEROKU_APP_URL}/subscribe_page`,
    })
    .then((body) => {
      const pageObj = JSON.parse(body);
      this.setState({subscribedPage: pageObj});
    });
  }

  renderSubscribedPageNotice() {
    return this.state.subscribedPage.name 
      ? (
        <div className="alert alert-success">
          Already connected to facebook page&nbsp;
          <a href={`https://www.facebook.com/${this.state.subscribedPage.id}`} target="_blank">
            {this.state.subscribedPage.name}(id:{this.state.subscribedPage.id})
          </a>.
        </div>
      )
      : '';
  }

  renderPageSelector() {
    const selector = (
      <div key="selector">
        <form className="form-inline" onSubmit={this.setupBot.bind(this)}>
          {this.renderPageSelectDropdownButton()}
          &nbsp;&nbsp;
          <button type="submit" className="btn btn-primary">Connect</button>
        </form>
        <ToastContainer autoClose={3000} />
      </div>
    );
    if (this.state.subscribedPage.id !== null) {
      return (
        <Folderable isFold={true} folddedLabel={'Change to another page'} expandedLabel={'Close and keep my page'}>
          {selector}
        </Folderable>
      );
    } else {
      return selector;
    }
  }

  render() {
    return (
      <div>
        <div key="headline">
          <h1>Welcome to Bot Manager!</h1>
          <p>To get started, please select the page you would like the bot to look after.</p>
          <br/>
        </div>
        {this.renderSubscribedPageNotice()}
        {this.renderPageSelector()}
      </div>
    );
  }
}
