import React from 'react';
import Link from 'manager/components/Link.jsx';
import {questionWithNextMap} from './index';

export default class ConditionalLogicHelper {
  static renderAllAnchors(questionFlowUtil) {
    return questionFlowUtil.getAllAnchors().map(([anchor, _qid]) => {
      return <option key={anchor}>{anchor}</option>;
    });
  }

  static renderAddNextIfPossible(questionOrOption, onAddNext) {
    // case 1: have type, but in question type with next map is false
    if (questionOrOption.type && !questionWithNextMap[questionOrOption.type]) {
      return '';
    }
    // case 2: already have next
    if (questionOrOption.next) {
      return '';
    }

    return (
      <span style={{marginRight: '1em', cursor: 'pointer'}}>
        <span className="badge badge-secondary" onClick={onAddNext}>+next</span>
      </span>
    );
  }

  static renderNextInQuestionIfPossible(qid, question, questionFlowUtil, onChangeNext, onRemoveNext) {
    let remover = <sup><Link onClick={onRemoveNext}><i className="fa fa-remove" /></Link></sup>;
    let nextElemID = `next-${qid}`;
    if (question.next) {
      return (
        <div id={nextElemID} className="form-row">
          <label className="col-sm-3 col-form-label">Next <sup>{remover}</sup></label>
          <div className="col-sm-9">
            <select className="form-control" value={question.next} onChange={onChangeNext}>
              {this.renderAllAnchors(questionFlowUtil)}
            </select>
          </div>
        </div>
      );
    }
    return null;
  }

  static renderNextInOptionIfPossible(qid, optionIndex, option, questionFlowUtil, onChangeNext, onRemoveNext) {
    let remover = <sup><Link onClick={onRemoveNext}><i className="fa fa-remove" /></Link></sup>;
    let nextElemID = `next-${qid}-${optionIndex}`;
    if (option.next) {
      return (
        <div id={nextElemID} className="form-group row">
          <label className="col-sm-3 col-form-label">Next<sup>{remover}</sup></label>
          <div className="col-sm-9">
            <select className="form-control" value={option.next} onChange={onChangeNext}>
              {this.renderAllAnchors(questionFlowUtil)}
            </select>
          </div>
        </div>
      );
    }
    return null;
  }

  static renderNextInCarouselButtonIfPossible(
    qid,
    elementIndex,
    buttonIndex,
    button,
    questionFlowUtil,
    onChangeNext,
    onRemoveNext) {

    let remover = <sup><Link onClick={onRemoveNext}><i className="fa fa-remove" /></Link></sup>;
    let nextElemID = `next-${qid}-${elementIndex}-${buttonIndex}`;
    if (button.next) {
      return (
        <div id={nextElemID} className="form-group row">
          <label className="col-sm-3 col-form-label">Next<sup>{remover}</sup></label>
          <div className="col-sm-9">
            <select className="form-control" value={button.next} onChange={onChangeNext}>
              {this.renderAllAnchors(questionFlowUtil)}
            </select>
          </div>
        </div>
      );
    }
    return null;
  }
}
