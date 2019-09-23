import React from 'react';
import ConditionalLogicHelper from './ConditionalLogicHelper.jsx';

export default class TandCCard extends React.Component {
  constructor() {
    super();
  }

  static getType() {
    return 't&c';
  }

  static canHaveNext() {
    return true;
  }

  static getGenerator() {
    return (qid, question, commonToolbar, questionFlowUtil, botConfig) => {
      return (
        <TandCCard
          key={qid}
          qid={qid}
          question={question}
          commonToolbar={commonToolbar}
          questionFlowUtil={questionFlowUtil}
          botConfig={botConfig}
        />
      );
    };
  }

  onChangeText(event) {
    let new_question = Object.assign({}, this.props.question, {text: event.target.value});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onChangeURLText(event) {
    let new_question = Object.assign({}, this.props.question, {urlText: event.target.value});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onChangeURL(event) {
    let new_question = Object.assign({}, this.props.question, {url: event.target.value});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onChangeNext(event) {
    let new_question = Object.assign({}, this.props.question, {next: event.target.value});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onRemoveNext(_event) {
    let new_question = Object.assign({}, this.props.question, {next: undefined});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  render() {
    return (
      <div className="card">
        {this.props.commonToolbar}
        <div className="card-body">
          <form className="form">
            <div className="form-group">
              <label>Text</label>
              <textarea
                className="form-control"
                rows="3"
                value={this.props.question.text}
                onChange={this.onChangeText.bind(this)}
              />
            </div>
            <div className="form-group">
              <label>URL Text</label>
              <input
                type="text"
                className="form-control"
                value={this.props.question.urlText}
                onChange={this.onChangeURLText.bind(this)}
              />
            </div>
            <div className="form-group">
              <label>URL</label>
              <div className="input-group">
                <input type="text"
                  className="form-control"
                  placeholder="https://to/your/terms_and_conditions"
                  value={this.props.question.url}
                  onChange={this.onChangeURL.bind(this)}
                />
                <div className="input-group-append">
                  <a className="btn btn-secondary" href={this.props.question.url} target="_blank">Open It!</a>
                </div>
              </div>
            </div>
          </form>
          {ConditionalLogicHelper.renderNextInQuestionIfPossible(
            this.props.qid,
            this.props.question,
            this.props.questionFlowUtil,
            this.onChangeNext.bind(this),
            this.onRemoveNext.bind(this),
          )}
        </div>
      </div>
    );
  }
}
