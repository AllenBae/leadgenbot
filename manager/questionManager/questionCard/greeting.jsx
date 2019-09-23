import React from 'react';
import ConditionalLogicHelper from './ConditionalLogicHelper.jsx';
import immutable from 'object-path-immutable';

export default class GreetingCard extends React.Component {
  constructor() {
    super();
  }

  static getType() {
    return 'greeting';
  }

  static canHaveNext() {
    return true;
  }

  static getGenerator() {
    return (qid, question, commonToolbar, questionFlowUtil, botConfig) => {
      return (
        <GreetingCard
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

  onChangeNext(event) {
    let new_question = Object.assign({}, this.props.question, {next: event.target.value});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onRemoveNext(_event) {
    let new_question = Object.assign({}, this.props.question, {next: undefined});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onAddNewButton() {
    let new_question = immutable.push(
      this.props.question,
      'buttons',
      {
        title: 'Title',
        url: 'https://example.com',
      },
    );

    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  renderAddButtonTrigger() {
    let buttons = this.props.question.buttons;
    if (!buttons) { buttons = []; }
    if (buttons.length < 3) {
      return (
        <div className="form-group">
          <span className="badge badge-secondary"
            style={{cursor: 'pointer'}}
            onClick={this.onAddNewButton.bind(this)}>
            +Button
          </span>
        </div>
      );
    } else {
      return null;
    }
  }

  onChangeButtonAttr(buttonIndex, attr) {
    return (event) => {
      let new_question = immutable.set(
        this.props.question,
        `buttons.${buttonIndex}.${attr}`,
        event.target.value,
      );

      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  onRemoveButton(buttonIndex) {
    return () => {
      let new_question = immutable.del(
        this.props.question,
        `buttons.${buttonIndex}`,
      );
      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  renderButtons() {
    if (!this.props.question.buttons) {
      return null;
    }

    return this.props.question.buttons.map((button, index) => {
      return (
        <div key={index} className="form-group">
          <label>
            Button {index+1}
            &nbsp;&nbsp;
            <span className="badge badge-secondary"
              style={{cursor: 'pointer'}}
              onClick={this.onRemoveButton(index)}>
              <i className="fa fa-trash" />
            </span>
          </label>
          <div style={{marginLeft: '1em'}}>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Title</label>
              <div className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={button.title}
                  onChange={this.onChangeButtonAttr(index, 'title')}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">URL</label>
              <div className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={button.url}
                  onChange={this.onChangeButtonAttr(index, 'url')}
                />
              </div>
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    return (
      <div className="card">
        {this.props.commonToolbar}
        <div className="card-body">
          <form className="form">
            <div className="form-group">
              <label>Text</label>
              <textarea className="form-control"
                rows="3"
                value={this.props.question.text}
                onChange={this.onChangeText.bind(this)}>
              </textarea>
            </div>
            {this.renderButtons()}
            {this.renderAddButtonTrigger()}
            {ConditionalLogicHelper.renderNextInQuestionIfPossible(
              this.props.qid,
              this.props.question,
              this.props.questionFlowUtil,
              this.onChangeNext.bind(this),
              this.onRemoveNext.bind(this),
            )}
          </form>
        </div>
      </div>
    );
  }
}
