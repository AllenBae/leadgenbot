import request from 'request-promise';
import constant from 'common/constant';

/*
custom event firing
*/


export function cfbtr(question, pageId, recipientId, opts) {
  let eventName = question.event.name || question.event.standardEventName;
  const params = {
    event: 'CUSTOM_APP_EVENTS',
    custom_events: JSON.stringify([{
      _eventName: eventName,
      _valueToSum: 1,
      _trigger: opts.trigger, //start or end of message
      _payload: opts.payload, //payload of reply (if not empty)
      _question: question.text,
      fb_currency: 'USD',
      utm_source: JSON.stringify([constant.HEROKU_APP_URL]),
    }]),
    extinfo: JSON.stringify(['mb1']),
    advertiser_tracking_enabled: 1,
    application_tracking_enabled: 1,
    page_id: pageId,
  };
  if (recipientId) {
    params.page_scoped_user_id = recipientId;
  } else {
    params.anon_id = 0;
  }

  return request.post({
    url : `https://graph.facebook.com/${constant.FB_APP_ID}/activities`,
    json: params,
  })
  .then(() => {
    // simple ignore
    console.log(`Done sent measurement ${eventName}`);
  })
  .catch((_err) => {
    // simply ignore any errs
    console.log(`Error sending measurement ${_err.message}`);
  });
}
