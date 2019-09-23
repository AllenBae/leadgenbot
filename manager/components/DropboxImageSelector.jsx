import React from 'react';

export default class DropboxImageSelector extends React.Component {

  constructor(props) {
    super(props);
    this.inputRef = null;
  }

  getPermanetLinkFromChooserFile(chooserFile) {
    const url = new URL(chooserFile.link);
    return `https://dl.dropboxusercontent.com${url.pathname}?dl=0`;
  }

  onDropboxSelectSuccess(files) {
    const link = this.getPermanetLinkFromChooserFile(files[0]);
    let event = new Event('change', {bubbles: true});
    event.simulated = true;
    this.inputRef.value = link;
    this.inputRef.dispatchEvent(event);
    this.props.onChange && this.props.onChange(event);
  }

  startDropboxSelect() {
    if (window.Dropbox && window.Dropbox.choose) {
      window.Dropbox.choose({
        linkType: 'preview',
        extensions: ['.jpg', '.gif', '.png'],
        folderselect: false,
        success: this.onDropboxSelectSuccess.bind(this),
      });
    }
  }

  insertDropinsScriptIfNotExist() {
    if (!document.getElementById('dropboxjs')) {
      const s = document.createElement('script');
      s.id = 'dropboxjs';
      s.setAttribute('data-app-key', this.props.appKey);
      s.src = 'https://www.dropbox.com/static/api/2/dropins.js';
      s.async = 1;
      document.body.appendChild(s);
    }
  }

  componentDidMount() {
    this.insertDropinsScriptIfNotExist();
  }

  render() {
    return (
      <div>
        <div className="input-group">
          <input className={this.props.className}
              ref={elem => this.inputRef = elem}
              value={this.props.value}
              onChange={this.props.onChange} />
          {this.props.appKey
           ? <div className="input-group-append">
               <button className="btn btn-outline-primary"
                       type="button"
                       onClick={this.startDropboxSelect.bind(this)}>
                 <i className="fa fa-dropbox"></i>
               </button>
             </div>
           : ''}
        </div>
        <div>
          <img src={this.props.value}
            height="100"
            className="rounded"
            title="Image Thumbnail"></img>
        </div>
      </div>
    );
  }
}
