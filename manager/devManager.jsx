import React from 'react';

import QuestionsConfig from './questionManager/questionsConfig.jsx';

export default class DevManager extends React.Component {

  renderMainContent() {
    let WrappedContent = QuestionsConfig;
    return (
      <WrappedContent {...this.props} />
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
      </div>
    );
  }
}
