import React from 'react';
import ConditionalLogicHelper from './ConditionalLogicHelper.jsx';
import immutable from 'object-path-immutable';

const QUICK_REPLY_TYPES = {
  user_phone_number: 'Phone Number',
  user_email: 'Email',
  location: 'Location',
};

export default class InputCard extends React.Component {
  constructor() {
    super();
  }

  static getType() {
    return 'input';
  }

  static canHaveNext() {
    return true;
  }

  static getGenerator() {
    return (qid, question, commonToolbar, questionFlowUtil, botConfig) => {
      return (
        <InputCard
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

  onChange(event) {
    let name = event.target.name;
    let new_question = Object.assign({}, this.props.question, {[name]: event.target.value});
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

  onRemoveQuickReply(idx) {
    return () => {
      let new_question = immutable.del(
        this.props.question,
        `quick_replies.${idx}`
      );

      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  onAddQuickReplies() {
    let new_question = immutable.push(
      this.props.question,
      'quick_replies',
      {
        content_type: Object.keys(QUICK_REPLY_TYPES)[0],
      },
    );

    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onChangeQuickReply(idx) {
    return (event) => {
      let new_question = immutable.set(
        this.props.question,
        `quick_replies.${idx}.content_type`,
        event.target.value,
      );

      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  renderQuickReplies() {
    if (!this.props.question.quick_replies) {
      return null;
    }

    return this.props.question.quick_replies.map((quick_reply, idx) => {
      return (
        <div id={`quick_reply_${idx}`} className="form-group row" key={`quick_reply_${idx}`}>
          <label className="col-sm-3 col-form-label">
            Quick Reply {idx+1}
            &nbsp;&nbsp;
            <span className="badge badge-secondary"
              style={{cursor: 'pointer'}}
              onClick={this.onRemoveQuickReply(idx)}>
              <i className="fa fa-trash" />
            </span>
          </label>

          <div className="col-sm-9">
            <select className="form-control" value={quick_reply.content_type} onChange={this.onChangeQuickReply(idx)}>
              {Object.entries(QUICK_REPLY_TYPES).map(([key, val]) => {
                return <option key={key} value={key}>{val}</option>;
              })}
            </select>
          </div>
        </div>
      );
    });
  }

  renderQuickReplySection() {
    return (
      <div className="form-group">
        <span className="badge badge-secondary"
          style={{cursor: 'pointer'}}
          onClick={this.onAddQuickReplies.bind(this)}>
          + Quick Replies
        </span>
        {this.renderQuickReplies()}
      </div>
    );
  }

  render() {
    return (
      <div className="card">
        {this.props.commonToolbar}
        <div className="card-body">
          <div className="form-group">
            <label>Text</label>
            <textarea
              className="form-control"
              rows="3"
              value={this.props.question.text}
              name="text"
              onChange={this.onChange.bind(this)}
            />
          </div>
          {this.renderQuickReplySection()}
          <div className="row">
            <div style={{marginRight:'3em'}}>
              <input type="checkbox"
              name="acceptsMedia"
              checked={this.props.question.acceptsMedia}
              onChange={this.onChange.bind(this)}
              style={{margin:'0.2em'}} /> Accepts Video/Photo
            </div>
          </div>
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
