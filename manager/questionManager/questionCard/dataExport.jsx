import React from 'react';
import Modal from 'react-responsive-modal';
import {questionHandlerMap} from '../../../server/handler/questionHandlers.js';

export default class DataExport extends React.Component {
  constructor() {
    super();
    this.state = {
      edit: false,
      colName: '',
    };

    this.onChange = this.onChange.bind(this);
    this.showEdit = this.showEdit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.onUpdateExport = this.onUpdateExport.bind(this);
  }

  componentDidMount() {
    let question = this.props.question;
    let colName = (question.export) ? question.export.colName : '';

    this.setState({
      colName: colName,
    });
  }

  showEdit() {
    this.setState({edit: true});
  }

  handleClose() {
    this.setState({edit: false});
  }

  onUpdateExport() {
    let nobj = {
      colName:this.state.colName
    };
    console.log(nobj);
    let qid = this.props.qid;
    this.props.onChangeExport && this.props.onChangeExport(qid, nobj);
    this.handleClose();
  }

  onChange(event) {
    let val = event.target.value;
    let name = event.target.name;

    this.setState({
      [name]: val,
    });
  }

  renderModal() {
    return (
      <Modal open={this.state.edit}
        onClose={this.handleClose}
        style={{zIndex: '1000'}}>
        <h4>Data Export Settings</h4>
        <div className="container" style={{minWidth:'500px'}}>
          <div className="row">
            <label className="col-form-label">Column name</label>
            <input className="form-control"
              type="text"
              name="colName"
              value={this.state.colName}
              onChange={this.onChange}
              placeholder="Column name" />
          </div>
        </div>
        <br />
        <button type="button" className="btn btn-primary" onClick={this.onUpdateExport}>Save</button>
      </Modal>
    );
  }

  genElemID() {
    return `export-${this.props.qid}`;
  }

  render() {
    let needNoAnswer = questionHandlerMap[this.props.question.type](0, this.props.question, {})[1];

    return (
      !needNoAnswer && (
        <div id={this.genElemID()} style={{marginRight: '1em', cursor: 'pointer', display:'inline-block'}}>
          <span className="badge badge-secondary" onClick={this.showEdit}>data export settings</span>
          {this.renderModal()}
        </div>
      )
    );
  }
}
