import React from 'react';
import joint from 'jointjs';
import Raphael from 'raphael';

import QuestionChartNavigator from './questionChartNavigator.jsx';

const LINK_MAX_LABEL_LENGTH = 7;
const NODE_MAX_CONTENT_LABEL_LENGTH = 28;
const NODE_MAX_CONTENT_LABEL_LENGTH_CJK = 14;
const SHOWNAV_MIN_WIDTH = 920;
const SHOWNAV_MIN_HEIGHT = 1380;
const VIEWPORT_MAX_WIDTH = 400;
const VIEWPORT_MAX_HEIGHT = 400;

const CJK_REGEX = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;

function isTextCJK(text) {
  return text.match(CJK_REGEX);
}

function getSVGRenderedTextSize(string, fontSize) {
  const paper = Raphael(0, 0, 0, 0);
  paper.canvas.style.visibility = 'hidden';
  const el = paper.text(0, 0, string);
  //el.attr('font-family', font);
  el.attr('font-size', fontSize);
  const bBox = el.getBBox();
  paper.remove();
  return {
    width: bBox.width,
    height: bBox.height,
  };
}

joint.dia.Element.define('leadgenbot.Node',
  {
    size: {
      width: 200,
      height: 80
    },
    attrs: {
      rect: {
        refWidth: '100%',
        refHeight: '100%',
        fill: 'ivory',
        stroke: 'gray',
        strokeWidth: 2,
        rx: 4,
        ry: 4
      },
      typeLabel: {
        refX: '10%',
        refY: '20%',
        yAlignment: 'middle',
        xAlignment: 'left',
        fontSize: 10
      },
      contentLabel: {
        refX: '50%',
        refY: '50%',
        yAlignment: 'middle',
        xAlignment: 'middle',
        fontSize: 14
      },
      anchorRect: {
        refX: '5%',
        refY: '70%',
        fill: '#49a0b5',
        strokeWidth: 0,
        height: '1em',
        rx: 8,
        ry: 8,
      },
      anchor: {
        refX: '10%',
        refY: '80%',
        yAlignment: 'middle',
        xAlignment: 'left',
        fill: 'white',
        fontSize: 10
      },
    }
  },
  {
    markup: [
      {tagName: 'rect', selector: 'rect'},
      {tagName: 'text', selector: 'typeLabel'},
      {tagName: 'text', selector: 'contentLabel'},
      {tagName: 'rect', selector: 'anchorRect'},
      {tagName: 'text', selector: 'anchor'},
    ],

    setTypeLabel: function(text) {
      return this.attr('typeLabel/text', text || '');
    },

    setContentLabel: function(text) {
      return this.attr('contentLabel/text', text || '');
    },

    setAnchor: function(text) {
      if (!text || text === '') {
        this.attr('anchorRect/visibility', 'hidden');
        return this.attr('anchor/visibility', 'hidden');
      } else {
        const fontSize = 10;
        const padding = 18;
        const size = getSVGRenderedTextSize(text, fontSize);
        this.attr('anchorRect/width', size.width + padding);
        return this.attr('anchor/text', text || '');
      }
    }
  });

joint.dia.Link.define('leadgenbot.Link',
  {
    attrs: {
      '.connection': {
        stroke: 'gray',
        strokeWidth: 2,
        pointerEvents: 'none',
        targetMarker: {
          type: 'path',
          fill: 'gray',
          stroke: 'none',
          d: 'M 10 -10 0 0 10 10 z'
        }
      }
    },
    connector: {
      name: 'rounded'
    },
    z: -1,
    weight: 1,
    minLen: 1,
    labelPosition: 'c',
    labelOffset: 10,
    labelSize: {
      width: 50,
      height: 30
    },
    labels: [{
      markup: '<rect/><text/>',
      attrs: {
        text: {
          fill: 'black',
          textAnchor: 'middle',
          refY: 10,
          refY2: '-50%',
          fontSize: 10
        },
        rect: {
          fill: 'lightgray',
          stroke: 'gray',
          strokeWidth: 2,
          refWidth: '100%',
          refHeight: '100%',
          refX: '-50%',
          refY: '-50%',
          rx: 5,
          ry: 5
        }
      },
      size: {
        width: 50, height: 30
      }
    }]
  },
  {
    markup: '<path class="connection" fill="none"/><g class="labels"/>',

    connect: function(sourceId, targetId) {
      return this.set({
        source: { id: sourceId },
        target: { id: targetId }
      });
    },

    setLabelText: function(text) {
      return this.prop('labels/0/attrs/text/text', text || '');
    }
  });

const ChartControls = joint.mvc.View.extend({
  events: {
    change: 'layout',
    input: 'layout'
  },

  options: {
    padding: 50
  },

  init: function() {
    const options = this.options;
    if (options.adjacencyList) {
      options.cells = this.buildGraphFromAdjacencyList(options.adjacencyList);
    }

    this.listenTo(options.paper.model, 'change', function(_cell, opt) {
      if (opt.layout) {
        this.layout();
      }
    });
  },

  layout: function() {
    const paper = this.options.paper;
    const graph = paper.model;
    const cells = this.options.cells;

    joint.layout.DirectedGraph.layout(cells, this.getLayoutOptions());

    if (graph.getCells().length === 0) {
      // The graph could be empty at the beginning to avoid cells rendering
      // and their subsequent update when elements are translated
      graph.resetCells(cells);
    }

    paper.fitToContent({
      padding: this.options.padding,
      allowNewOrigin: 'any'
    });

    this.trigger('layout');
  },

  getLayoutOptions: function() {
    return {
      setVertices: true,
      setLabels: true,
      ranker: 'network-simplex',
      rankDir: 'TB',
      align: 'UL',
      rankSep: 50,
      edgeSep: 50,
      nodeSep: 50
    };
  },

  buildGraphFromAdjacencyList: function(adjacencyList) {
    const elements = [];
    const links = [];

    // Add element
    Object.keys(adjacencyList).forEach((parentLabel) => {
      const parentData = adjacencyList[parentLabel];
      const label = parentData.question.text
        ? isTextCJK(parentData.question.text)
          ? parentData.question.text.length > NODE_MAX_CONTENT_LABEL_LENGTH_CJK
            ? parentData.question.text.substr(0, NODE_MAX_CONTENT_LABEL_LENGTH_CJK - 3) + '...'
            : parentData.question.text
          : parentData.question.text.length > NODE_MAX_CONTENT_LABEL_LENGTH
            ? parentData.question.text.substr(0, NODE_MAX_CONTENT_LABEL_LENGTH - 3) + '...'
            : parentData.question.text
        : '(no text)';
      elements.push(
          new joint.shapes.leadgenbot.Node({id: parentLabel})
            .setTypeLabel(`${parentLabel} ${parentData.question.type}`)
            .setContentLabel(label)
            .setAnchor(parentData.question.anchor)
      );
    });

    elements.push(
      new joint.shapes.leadgenbot.Node({id: '#' + elements.length})
        .setTypeLabel('#' + elements.length)
        .setContentLabel('End')
    );

    // Add links
    Object.keys(adjacencyList).forEach((parentLabel) => {
      adjacencyList[parentLabel].alist.forEach((child) => {
        const label = child.label.length > LINK_MAX_LABEL_LENGTH ? '(.....)' : child.label;
        links.push(
            new joint.shapes.leadgenbot.Link()
              .connect(parentLabel, child.id)
              .setLabelText(label)
        );
      });
    });

    // Links must be added after all the elements. This is because when the links
    // are added to the graph, link source/target
    // elements must be in the graph already.
    return elements.concat(links);
  }
});

export default class QuestionsChart extends React.Component {

  constructor(props) {
    super(props);
    this.chartContainerElem = null;
    this.chartElem = null;
    this.navigator = null;
    this.chartSvgWidth = 0;
    this.chartSvgHeight = 0;
    this.chartElemWidth = 0;
    this.chartElemHeight = 0;
  }

  getQuesitonChartContainerBBox() {
    const el = this.chartContainerElem;
    return {
      top: el.offsetTop,
      left: el.offsetLeft,
      height: el.offsetHeight,
      width: el.offsetWidth,
    };
  }

  renderMainChart(questionAdjacencyList) {
    const paper = new joint.dia.Paper({
      el: this.chartElem,
      interactive: function(_cellView, _method) {
        return false;
      }
    });

    paper.on('element:pointerdown', (elementView) => {
      const m = elementView.model;
      const evbbox = elementView.getBBox();
      const cbbox = this.getQuesitonChartContainerBBox();
      const tipOffset = 10;
      const id = parseInt(m.id.substr(1), 10);
      const svgel = this.chartElem.querySelector('svg');
      const viewBox = svgel.viewBox.baseVal;
      const css = {
        left: `${cbbox.left + evbbox.x + evbbox.width + tipOffset - viewBox.x}px`,
        top: `${cbbox.top + evbbox.y - viewBox.y}px`,
      };
      this.props.showQuestionCard(id, css);
    });

    paper.on('blank:pointerdown', () => {
      this.props.hideActiveQuestionCard();
    });

    const controls = new ChartControls({
      el: this.containerElem,
      paper: paper,
      adjacencyList: questionAdjacencyList
    });
    controls.layout();
  }

  hideAllQuestionCard() {
    this.props.hideActiveQuestionCard();
  }

  renderNavigatorChart(questionAdjacencyList) {
    const navipaper = new joint.dia.Paper({
      el: this.navigator.navigatorElem,
      interactive: function(_cellView, _method) {
        return false;
      }
    });

    const navcontrols = new ChartControls({
      el: this.navigator.containerElem,
      paper: navipaper,
      adjacencyList: questionAdjacencyList
    });
    navcontrols.layout();
  }

  layoutChartAndNavigator() {
    // layout navigator according to our svg's ratio
    this.chartSvgWidth = parseInt(this.chartElem.style.width, 10);
    this.chartSvgHeight = parseInt(this.chartElem.style.height, 10);
    const r = this.chartSvgWidth / this.chartSvgHeight;
    const navWidth = r > 1 ? VIEWPORT_MAX_WIDTH : VIEWPORT_MAX_HEIGHT * r;
    const navHeight = r > 1 ? VIEWPORT_MAX_WIDTH / r : VIEWPORT_MAX_HEIGHT;
    this.navigator.navigatorElem.style.width = navWidth;
    this.navigator.navigatorElem.style.height = navHeight;

    // scale the copy of svg in navigator to proper size
    const svgel = this.navigator.navigatorElem.querySelector('svg');
    svgel.setAttribute('width', navWidth);
    svgel.setAttribute('height', navHeight);
    svgel.setAttribute('viewBox', `0 0 ${this.chartSvgWidth} ${this.chartSvgHeight}`);

    // put navigator next to chart div, top aligned, navigator left align to chart right
    const br = this.chartContainerElem.getBoundingClientRect();
    this.navigator.containerElem.style.top = br.y;
    this.navigator.containerElem.style.left = br.x + br.width;

    // restrict chart div
    this.chartElemWidth = br.width;
    this.chartElemHeight = window.innerHeight - this.chartContainerElem.offsetTop - 65;
    this.chartElem.style.width = '100%';
    this.chartElem.style.height = this.chartElemHeight;

    // scale viewport according to chart div to svg
    let sx = this.chartElemWidth / this.chartSvgWidth * 100;
    // magic number 101% is got by trying in UI, turns out 101% is the perfect max
    // maintaining best user experience
    sx = sx > 101 ? 101 : sx;
    let sy = this.chartElemHeight / this.chartSvgHeight * 100;
    sy = sy > 101 ? 101 : sy;
    this.navigator.viewportElem.style.width = `${sx}%`;
    this.navigator.viewportElem.style.height = `${sy}%`;

    // final fix the chart container size
    this.navigator.containerElem.style.width = navWidth;
    this.navigator.containerElem.style.height = navHeight;
  }

  renderChart(questionAdjacencyList) {
    this.renderMainChart(questionAdjacencyList);
    if (this.chartElem.offsetWidth > SHOWNAV_MIN_WIDTH ||
      this.chartElem.offsetHeight > SHOWNAV_MIN_HEIGHT) {
      this.renderNavigatorChart(questionAdjacencyList);
      this.layoutChartAndNavigator();
      this.navigator.show();
    }
  }

  onViewportChange(newOffsetRatio) {
    const svgel = this.chartElem.querySelector('svg');
    const {rx, ry} = newOffsetRatio;
    const x = Math.floor(rx * this.chartSvgWidth);
    const y = Math.floor(ry * this.chartSvgHeight);
    svgel.setAttribute('viewBox', `${x} ${y} ${this.chartElemWidth} ${this.chartElemHeight}`);
  }

  genQuestionAdjacencyList() {
    return this.props.questions.reduce((acc, question, index) => {
      const id = '#' + index;
      let alist = [];
      const allNextAttrsWithQids =
        this.props.questionFlowUtil.findAllNextAttrsWithQids(index, question);
      allNextAttrsWithQids.forEach(({nextPayload, nextText, nextQid}) => {
        alist.push({
          id: '#' + nextQid,
          label: nextPayload,
          title: nextText
        });
      });
      if (alist.length == 0) {
        const defaultNextId = '#' + (index+1);
        alist = [{id: defaultNextId, label: 'default', title: 'default'}];
      }
      acc[id] = {
        question: question,
        alist: alist
      };
      return acc;
    }, {});
  }

  shouldComponentUpdate(nextProps, _nextState) {
    const j1 = JSON.stringify(this.props.questions);
    const j2 = JSON.stringify(nextProps.questions);
    return j1 !== j2;
  }

  componentDidUpdate() {
    const questionAdjacencyList = this.genQuestionAdjacencyList();
    this.renderChart(questionAdjacencyList);
  }

  render() {
    return (
      <div className="question-chart-container"
           ref={elem => this.chartContainerElem = elem}>
        <QuestionChartNavigator
          ref={nav => this.navigator = nav}
          hideAllQuestionCard={this.hideAllQuestionCard.bind(this)}
          onViewportChange={this.onViewportChange.bind(this)} />
        <div className="question-chart" ref={elem => this.chartElem = elem}></div>
      </div>
    );
  }
}
