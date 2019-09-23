import React from 'react';

import WelcomeScreenConfig from './welcomeScreenConfig.jsx';
import HandoverConfig from './handoverConfig.jsx';
import ReminderConfig from './reminderConfig.jsx';

export default class BotConfigurator extends React.Component {
  constructor() {
    super();
  }

  static getID() {
    return 'bot_configurator';
  }

  static getTitle() {
    return 'Bot Configurator';
  }

  render() {
    return (
      <div>
        <h4>{WelcomeScreenConfig.getTitle()}</h4>
        <WelcomeScreenConfig {...this.props} />
        <HandoverConfig {...this.props} />
        <ReminderConfig {...this.props} />
      </div>
    );
  }
}
