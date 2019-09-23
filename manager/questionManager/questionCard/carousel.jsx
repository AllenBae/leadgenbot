import React from 'react';
import ConditionalLogicHelper from './ConditionalLogicHelper.jsx';
import {questionSamples} from 'common/question';
import immutable from 'object-path-immutable';

import DropboxImageSelector from 'manager/components/DropboxImageSelector.jsx';

export default class CarouselCard extends React.Component {
  constructor() {
    super();
  }

  static getType() {
    return 'carousel';
  }

  static canHaveNext() {
    return true;
  }

  static getGenerator() {
    return (qid, question, commonToolbar, questionFlowUtil, botConfig) => {
      return (
        <CarouselCard
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

  onRemoveElementButton(elementIndex, buttonIndex) {
    return () => {
      let new_question = immutable.del(
        this.props.question,
        `elements.${elementIndex}.buttons.${buttonIndex}`,
      );

      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  onChangeElementAttr(elementIndex, attr) {
    return (event) => {
      let new_question = immutable.set(
        this.props.question,
        `elements.${elementIndex}.${attr}`,
        event.target.value,
      );

      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  onChangeElementButtonAttr(elementIndex, buttonIndex, attr) {
    return (event) => {
      let new_question = immutable.set(
        this.props.question,
        `elements.${elementIndex}.buttons.${buttonIndex}.${attr}`,
        event.target.value,
      );

      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  onAddNewElement() {
    let sample_carousel = questionSamples['carousel']();

    let new_question = immutable.push(
      this.props.question,
      'elements',
      sample_carousel.elements[0],
    );

    this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
  }

  onAddNewElementButton(element, elementIndex) {
    return () => {
      let sample_carousel = questionSamples['carousel']();

      let new_question = immutable.push(
        this.props.question,
        `elements.${elementIndex}.buttons`,
        sample_carousel.elements[0].buttons[0],
      );

      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  onRemoveElement(elementIndex) {
    return () => {
      let new_question = immutable.del(
        this.props.question,
        `elements.${elementIndex}`,
      );
      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  onAddButtonNext(elementIndex, buttonIndex) {
    return () => {
      let allAnchors = this.props.questionFlowUtil.getAllAnchors();

      let new_question = immutable.set(
        this.props.question,
        `elements.${elementIndex}.buttons.${buttonIndex}.next`,
        allAnchors[0][0],
      );

      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  onChangeButtonNext(elementIndex, buttonIndex) {
    return (event) => {
      let new_question = immutable.set(
        this.props.question,
        `elements.${elementIndex}.buttons.${buttonIndex}.next`,
        event.target.value,
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

  onRemoveButtonNext(elementIndex, buttonIndex) {
    return (event) => {
      let new_question = immutable.del(
        this.props.question,
        `elements.${elementIndex}.buttons.${buttonIndex}.next`,
        event.target.value,
      );

      this.props.questionFlowUtil.updateQuestion(this.props.qid, new_question);
    };
  }

  renderElementButtons(element, element_index) {
    return element.buttons.map((button, btn_index) => {
      return (
        <div key={`${element_index}_${btn_index}`} className="form-group">
          <label>
            Button {btn_index+1}
            &nbsp;&nbsp;
            {ConditionalLogicHelper.renderAddNextIfPossible(
              button,
              this.onAddButtonNext(element_index, btn_index),
            )}
            &nbsp;&nbsp;
            <span className="badge badge-secondary"
              style={{cursor: 'pointer'}}
              onClick={this.onRemoveElementButton(element_index, btn_index)}>
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
                  onChange={this.onChangeElementButtonAttr(element_index, btn_index, 'title')}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">URL</label>
              <div className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={button.url}
                  onChange={this.onChangeElementButtonAttr(element_index, btn_index, 'url')}
                />
              </div>
            </div>

            {ConditionalLogicHelper.renderNextInCarouselButtonIfPossible(
              this.props.qid,
              element_index,
              btn_index,
              button,
              this.props.questionFlowUtil,
              this.onChangeButtonNext(element_index, btn_index),
              this.onRemoveButtonNext(element_index, btn_index),
            )}
          </div>
        </div>
      );
    });
  }

  renderAddNewElementButtonTrigger(element, index) {
    if (element.buttons.length < 3) {
      return (
        <div className="form-group">
          <span className="badge badge-secondary"
            style={{cursor: 'pointer'}}
            onClick={this.onAddNewElementButton(element, index)}>
            +Button
          </span>
        </div>
      );
    } else {
      return null;
    }
  }

  renderElements() {
    return this.props.question.elements.map((element, index) => {
      return (
        <div key={index} className="form-group">
          <label>
            Element {index+1}
            &nbsp;&nbsp;
            <span className="badge badge-secondary"
              style={{cursor: 'pointer'}}
              onClick={this.onRemoveElement(index)}>
              <i className="fa fa-trash" />
            </span>
          </label>
          <div style={{marginLeft: '1em'}}>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Title</label>
              <div className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={element.title}
                  onChange={this.onChangeElementAttr(index, 'title')}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Subtitle</label>
              <div className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={element.subtitle}
                  onChange={this.onChangeElementAttr(index, 'subtitle')}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">URL</label>
              <div className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={element.url}
                  onChange={this.onChangeElementAttr(index, 'url')}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Image URL</label>
              <div className="col-sm-9">
                <DropboxImageSelector className="form-control"
                  value={element.image_url}
                  onChange={this.onChangeElementAttr(index, 'image_url')}
                  appKey={this.props.botConfig.dropboxAppKey} />
              </div>
            </div>

            {this.renderElementButtons(element, index)}
            {this.renderAddNewElementButtonTrigger(element, index)}
          </div>
        </div>
      );
    });
  }

  renderAddNewElementTrigger() {
    return (
      <div className="form-group">
        <span className="badge badge-secondary"
          style={{cursor: 'pointer'}}
          onClick={this.onAddNewElement.bind(this)}>
          +Element
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
            {this.renderElements()}
            {this.renderAddNewElementTrigger()}
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
