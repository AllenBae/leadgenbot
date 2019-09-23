import React from 'react';
import Modal from 'react-responsive-modal';
import {questionHandlerMap} from '../../../server/handler/questionHandlers.js';

export default class LeadQualtification extends React.Component {
  constructor() {
    super();
    this.state = {
      edit: false,
      isLeadQualifyingStep: '',
    };

    this.onChange = this.onChange.bind(this);
    this.showEdit = this.showEdit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.onUpdateLeadQualification = this.onUpdateLeadQualification.bind(this);
  }

  componentDidMount() {
    let question = this.props.question;
    let isLeadQualifyingStep = (question.leadQualification) ? question.leadQualification.isLeadQualifyingStep : false;

    this.setState({
      isLeadQualifyingStep: isLeadQualifyingStep,
    });
  }

  showEdit() {
    this.setState({edit: true});
  }

  handleClose() {
    this.setState({edit: false});
  }

  onUpdateLeadQualification() {
    let nobj = {
      isLeadQualifyingStep:this.state.isLeadQualifyingStep
    };
    console.log(nobj);
    let qid = this.props.qid;
    this.props.onChangeLeadQualification && this.props.onChangeLeadQualification(qid, nobj);
    console.log(nobj);
    this.handleClose();
  }

  onChange(event) {
    let name = event.target.name;
    let value = (event.target.type == 'checkbox' ? event.target.checked : event.target.value);

    this.setState({
      [name]: value
    });
  }

  renderModal() {
    return (
      <Modal open={this.state.edit}
        onClose={this.handleClose}
        style={{zIndex: '1000'}}>
        <h4>Lead Qualification Settings</h4>
        <div className="container" style={{minWidth:'500px'}}>
          <div className="row">
            <div style={{marginRight:'3em'}}>
              <input type="checkbox"
              name="isLeadQualifyingStep"
              checked={this.state.isLeadQualifyingStep}
              onChange={this.onChange}
              style={{margin:'0.2em'}} /> Lead is considered qualified when user reach this step
            </div>
          </div>
        </div>
        <br />
        <button type="button" className="btn btn-primary" onClick={this.onUpdateLeadQualification}>Save</button>
      </Modal>
    );
  }

  genElemID() {
    return `export-${this.props.qid}`;
  }

  render() {
    return (
      <div id={this.genElemID()} style={{marginRight: '1em', cursor: 'pointer', display:'inline-block'}}>
        <span className="badge badge-secondary" onClick={this.showEdit}>lead qualification</span>
        {this.renderModal()}
      </div>
    );
  }
}
