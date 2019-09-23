import React from 'react';
import { push as BurgerMenu } from 'react-burger-menu';

import constant from './constant';
import PageSelector from './selector/pageSelector.jsx';
import QuestionsConfig from './questionManager/questionsConfig.jsx';
import LeadManager from './lead/leadManager.jsx';
import BotConfigurator from './configurator/configurator.jsx';
import BotManager from './bot/botManager.jsx';
import DevTools from './devtools/devtools.jsx';
import Link from './components/Link.jsx';

const menus = [
  { id: PageSelector.getID(), title: PageSelector.getTitle(), class: PageSelector },
  { id: BotConfigurator.getID(), title: BotConfigurator.getTitle(), class: BotConfigurator },
  { id: QuestionsConfig.getID(), title: QuestionsConfig.getTitle(), class: QuestionsConfig },
  { id: LeadManager.getID(), title: LeadManager.getTitle(), class: LeadManager },
  { id: BotManager.getID(), title: BotManager.getTitle(), class: BotManager },
];

if (constant.NODE_ENV == 'dev') {
  menus.push({ id: DevTools.getID(), title: DevTools.getTitle(), class: DevTools });
}

export default function withBurgerMenu(WrappedComponent) {
  return class extends React.Component {
    constructor() {
      super();
      this.state = {
        currentContent: menus[0].id,
        isBurgerMenuOpen: false,
      };
    }

    onClickBurgerMenu(menu_id) {
      return (event) => {
        event.preventDefault();
        this.setState({
          currentContent: menu_id,
          isBurgerMenuOpen: false,
        });
      };
    }

    changeToMenu(menu_id) {
      this.setState({currentContent: menu_id});
    }

    renderBurgerMenuButton() {
      let icon = this.state.isBurgerMenuOpen ? 'fa fa-2x fa-bars invisible' : 'fa fa-bars fa-2x';
      let {title: menuTitle} = menus.find((menu) => {
        return menu.id == this.state.currentContent;
      });
      return (
        <form>
          <div className="form-inline">
            <Link className="btn btn-link"
              onClick={() => { this.setState({ isBurgerMenuOpen: true }); }}>
              <span className="text-secondary">
                <i className={icon}></i>
              </span>
            </Link>
            <b>{menuTitle}</b>
          </div>
        </form>
      );
    }

    renderBurgerMenu() {
      let menu_items = [];
      menus.forEach(({id: the_id, title: the_title}, index) => {
        menu_items.push(
          <a id={the_id}
            key={index}
            className="nav-item"
            href="#"
            onClick={this.onClickBurgerMenu(the_id)}>
            {the_title}
          </a>
        );
      });
      return (
        <BurgerMenu isOpen={this.state.isBurgerMenuOpen}
          pageWrapId={"content-wrap"}
          outerContainerId={"outer-container"}
          customBurgerIcon={false}
          onStateChange={(state) => { this.setState({ isBurgerMenuOpen: state.isOpen }); }}>
          {menu_items}
        </BurgerMenu>
      );
    }

    render() {
      const {class: contentClass} = menus.find((menu) => {
        return menu.id == this.state.currentContent;
      });
      return (
        <div id="outer-container" style={{width: '100%', height: '100%'}}>
          {this.renderBurgerMenu()}
          <div id="content-wrap">
            {this.renderBurgerMenuButton()}
            <WrappedComponent
              currentContentClass={contentClass}
              changeToMenu={this.changeToMenu.bind(this)}
              {...this.props}
            />
          </div>
        </div>
      );
    }
  };
}
