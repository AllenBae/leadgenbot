import React from 'react';
import ConditionalLogicHelper from './ConditionalLogicHelper.jsx';
import {questionSamples} from 'common/question';
import immutable from 'object-path-immutable';

export default class ConfirmationCard extends React.Component {
  constructor() {
    super();
    this.onChangeAttr = this.onChangeAttr.bind(this);
  }

  static getType() {
    return 'confirmation';
  }

  static canHaveNext() {
    return true;
  }

  static getGenerator() {
    return (qid, question, commonToolbar, questionFlowUtil, botConfig) => {
      return (
        <ConfirmationCard
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

  onChangeAttr(event) {
    let name = event.target.name;
    let value = event.target.value;
    let new_question = Object.assign(
      {},
      this.props.question,
      {[name]: value}
    );

    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onChangeFieldAttr(fieldIndex, attr) {
    return (event) => {
      let new_question = immutable.set(
        this.props.question,
        `fields.${fieldIndex}.${attr}`,
        event.target.value,
      );

      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  onAddNewField() {
    let sample_confirmation = questionSamples['confirmation']();

    let new_question = immutable.push(
      this.props.question,
      'fields',
      sample_confirmation.fields[0],
    );

    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onRemoveField(fieldIndex) {
    return () => {
      let new_question = immutable.del(
        this.props.question,
        `fields.${fieldIndex}`,
      );
      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  onChangeNext(event) {
    let new_question = Object.assign({}, this.props.question, {next: event.target.value});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onRemoveNext(_event) {
    let new_question = Object.assign({}, this.props.question, {next: undefined});
    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  renderFields() {
    return this.props.question.fields.map((field, index) => {
      return (
        <div key={index} className="form-group">
          <label>
            Field {index+1}
            &nbsp;&nbsp;
            <span className="badge badge-secondary"
              style={{cursor: 'pointer'}}
              onClick={this.onRemoveField(index)}>
              <i className="fa fa-trash" />
            </span>
          </label>
          <div style={{marginLeft: '1em'}}>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Title</label>
              <div className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={field.title}
                  onChange={this.onChangeFieldAttr(index, 'title')}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Subtitle</label>
              <div className="col-sm-9">
                <select className="form-control"
                  value={field.anchor}
                  onChange={this.onChangeFieldAttr(index, 'anchor')}>
                  {ConditionalLogicHelper.renderAllAnchors(this.props.questionFlowUtil)}
                </select>
              </div>
            </div>
          </div>
        </div>
      );
    });
  }

  renderAddNewFieldTrigger() {
    return (
      <div className="form-group">
        <span className="badge badge-secondary"
          style={{cursor: 'pointer'}}
          onClick={this.onAddNewField.bind(this)}>
          +Field
        </span>
      </div>
    );
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
                name="text"
                onChange={this.onChangeAttr}
              />
            </div>
            <div className="form-group">
              <label>Confirmation Prompt</label>
              <input type="text"
                className="form-control"
                name="confirmation_prompt"
                value={this.props.question.confirmation_prompt}
                onChange={this.onChangeAttr}
              />
            </div>
            {this.renderFields()}
            {this.renderAddNewFieldTrigger()}
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
