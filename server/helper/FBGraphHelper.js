import constant from 'common/constant';
import logger from 'common/logger';
import fbrequest from 'common/fbrequest';
import * as url from 'url';

export default class FBGraphHelper {

  static setWebsiteURL() {
    const params = {
      access_token: constant.FB_APP_ACCESS_TOKEN,
      app_domains: [url.parse(constant.HEROKU_APP_URL).hostname],
      website_url: constant.HEROKU_APP_URL,
    };
    logger.info(
      `Setting Website URL to ${constant.HEROKU_APP_URL} with param: ${JSON.stringify(params)}`);
    return fbrequest.post({
      uri: `${constant.GRAPH_BASE_URL}/${constant.FB_APP_ID}`,
      json: params,
    })
    .then((_body) => {
      logger.info('Website URL set');
    })
    .catch((err) => {
      logger.error(`Website URL setting failed: ${err}`);
      if (err.stack) {
        logger.error(err.stack);
      }
      return err;
    });
  }

  static subscribeWebhooks(page) {
    let options = {
      uri: `${constant.GRAPH_BASE_URL}/${constant.FB_APP_ID}/subscriptions`,
      json: {
        access_token: constant.FB_APP_ACCESS_TOKEN,
        object: 'page',
        callback_url: constant.HEROKU_APP_URL + constant.WEBHOOK_PATH,
        fields: ['messages', 'messaging_postbacks'],
        verify_token: constant.WEBHOOK_VERIFY_TOKEN
      },
    };
    logger.info(`Subscribing webhook events with params: ${JSON.stringify(options.json)}`);

    return fbrequest.post(options)
      .then((_body) => {
        logger.info('Subscribed webhook events successfully');
        let params = {
          access_token: page.access_token,
        };
        logger.info(`Subscribing page to app with params: ${JSON.stringify(params)}`);
        return fbrequest.post({
          uri: `${constant.GRAPH_BASE_URL}/${page.id}/subscribed_apps`,
          json: params,
        });
      })
      .then((_body) => {
        logger.info('Subscribed page to app successfully');
      })
      .catch((err) => {
        logger.error(`Failed to subscribed page to app: ${JSON.stringify(err)}`);
        return err;
      });
  }
}
