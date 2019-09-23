import React from 'react';

export default class Folderable extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      fold: this.props.isFold || false,
    };
  }

  renderFolderLink() {
    if (this.state.fold) {
      return (
        <a href="#" onClick={() => { this.setState({fold: false}); }}>
          {this.props.folddedLabel || 'Show +'}
        </a>
      );
    } else {
      return (
        <a href="#" onClick={() => { this.setState({fold: true}); }}>
          {this.props.expandedLabel || 'Hide -'}
        </a>
      );
    }
  }

  render() {
    return (
      <div>
        <div>{this.renderFolderLink()}</div>
        <div>{this.state.fold ? '' : this.props.children}</div>
      </div>
    );
  }
}
