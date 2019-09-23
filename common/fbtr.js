import request from 'request-promise';

import constant from 'common/constant';

const APP_ID = 132502590902997;
const PAGE_ID = 357549008061567;

export let fbtrEvents = {
  LEADGENBOT_LAUNCH_APP: 'LEADGENBOT_LAUNCH_APP',
  LEADGENBOT_USER_LOGIN: 'LEADGENBOT_USER_LOGIN',
  LEADGENBOT_CONNECT_PAGE: 'LEADGENBOT_CONNECT_PAGE',
  LEADGENBOT_LEAD: 'LEADGENBOT_LEAD',
  LEADGENBOT_EXPORT_LEAD: 'LEADGENBOT_EXPORT_LEAD',
  LEADGENBOT_QUESTIONAIRE_UPDATE: 'LEADGENBOT_QUESTIONAIRE_UPDATE',
  LEADGENBOT_MSG_RECEIVED: 'LEADGENBOT_MSG_RECEIVED',
  LEADGENBOT_MSG_SENT: 'LEADGENBOT_MSG_SENT',
};

export function fbtr(customEvent, recipientId) {
  const params = {
    event: 'CUSTOM_APP_EVENTS',
    custom_events: JSON.stringify([{
      _eventName: customEvent,
      _valueToSum: 1,
      fb_currency: 'USD',
      utm_source: JSON.stringify([constant.HEROKU_APP_URL]),
    }]),
    advertiser_tracking_enabled: 1,
    application_tracking_enabled: 1,
    page_id: PAGE_ID,
  };
  if (recipientId) {
    params.page_scoped_user_id = recipientId;
  } else {
    params.anon_id = 0;
  }
  return request.post({
    url : `https://graph.facebook.com/${APP_ID}/activities`,
    form: params,
  })
  .then(() => {
    // simple ignore
    // console.log(`Done sent measurement ${customEvent}`);
  })
  .catch((_err) => {
    // simply ignore any errs
    // console.log(_err.message);
  });
}
