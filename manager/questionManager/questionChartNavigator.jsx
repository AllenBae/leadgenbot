import React from 'react';

export default class QuestionChartNavigator extends React.Component {

  constructor(props) {
    super(props);
    this.pos1 = this.pos2 = this.pos3 = this.pos4 = 0;
    this.containerElem = null;
    this.navigatorElem = null;
    this.viewportElem = null;
  }

  dragStart(e) {
    e = e || window.event;
    e.preventDefault();
    this.props.hideAllQuestionCard();
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    document.onmouseup = this.closeDrag.bind(this);
    document.onmousemove = this.elementDrag.bind(this);
  }
  
  elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    this.pos1 = this.pos3 - e.clientX;
    this.pos2 = this.pos4 - e.clientY;
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;

    const viewportWidth = this.viewportElem.offsetWidth;
    const viewportLeftMax = this.containerElem.offsetWidth - viewportWidth;
    const viewportHeight = this.viewportElem.offsetHeight;
    const viewportTopMax = this.containerElem.offsetHeight - viewportHeight;

    let left = this.viewportElem.offsetLeft - this.pos1;
    if (left < 0) {
      left = 0;
    } else if (left > viewportLeftMax) {
      left = viewportLeftMax;
    }
    
    let top = (this.viewportElem.offsetTop - this.pos2);
    if (top < 0) {
      top = 0;
    } else if (top > viewportTopMax) {
      top = viewportTopMax;
    }

    this.viewportElem.style.left = `${left}px`;
    this.viewportElem.style.top = `${top}px`;

    const containerWidth = this.containerElem.offsetWidth;
    const rx = left / containerWidth;
    const containerHeight = this.containerElem.offsetHeight;
    const ry = top / containerHeight;
    this.props.onViewportChange && this.props.onViewportChange({rx, ry});
  }
  
  closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  show() {
    if (this.containerElem.classList.contains('hide')) {
      this.containerElem.classList.remove('hide');
    }
  }

  render() {
    return (
      <div className="question-chart-navigator-container hide"
           ref={elem => this.containerElem = elem}>
        <div ref={elem => this.navigatorElem = elem}></div>
        <div className="question-chart-navigator-viewport"
             ref={elem => this.viewportElem = elem}
             onMouseDown={this.dragStart.bind(this)}>
        </div>
      </div>
    );
  }
}
