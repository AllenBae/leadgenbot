import request from 'request';
import logger from 'common/logger';
import constant from 'common/constant';
import moment from 'moment-timezone';

export function init(app, dh) {
  app.get('/reminders/send', (req, res) => {
    if (!process.env.REMINDER_SECRET) {
      console.log('Environment var REMINDER_SECRET not set. Endpoint disabled');
      res.sendStatus(500);
      return;
    }

    if (req.query['secret'] != process.env.REMINDER_SECRET) {
      res.sendStatus(500);
      return;
    }

    let sendLimit = parseInt(req.query['limit'], 10);

    // send reminder to user who has been idel for 120mins
    // or override by supplying window
    let lookbackWindow = parseInt(req.query['window'], 10) || 120;

    let minTime = (moment().subtract(24, 'hours').toDate()).getTime();
    let maxTime = (moment().subtract(lookbackWindow, 'minutes').toDate()).getTime();

    var sentCount = 0;

    // get last response
    dh.getLastRespondedBetween(minTime, maxTime)
      .then((userIDs) => {
        dh.getAccessToken()
          .then((access_token_mgr) => {
            let page_access_token = access_token_mgr.get(constant.PAGE_ACCESS_TOKEN_KEY);

            if (!isNaN(sendLimit)) {
              userIDs = userIDs.slice(0, sendLimit);
            }

            Promise.all(userIDs.map((userID) => {
              let reminderText = dh.botConfig.config.reminder_text;

              return new Promise((resolve, _reject) => {
                dh.getUserProfile(userID)
                  .then(([userProgress, userProfile]) => {
                    if (!userProfile.leadQualified && !userProfile.userProfile.reminderSent) {
                      logger.info(`will send reminder to ${userID}`);
                      request({
                        method: 'POST',
                        uri: `${constant.GRAPH_BASE_URL}/me/messages`,
                        qs: { access_token: page_access_token },
                        json: {
                          recipient: { id: userID },
                          message: {
                            text: reminderText,
                          },
                        },
                      },
                      (err, _res, body) => {
                        if (err) {
                          logger.info('Reminder sending failed');
                        } else {
                          logger.info(`Reminder sent with body ${JSON.stringify(body)}`);
                          userProfile.update({reminderSent: true}).then(() => {
                            ++sentCount;
                            resolve(userID);
                          });
                        }
                      });
                    } else {
                      logger.info(`will NOT send reminder to ${userID}`);
                      resolve();
                    }
                  });
              });
            })).then(() => {
              res.status(200).send(`${sentCount} reminder sent`);
            });
          });
      });

    // dh.datastore._zadd(
    //   dh.datastore.paths.user_response_updated,
    //   'test',
    //   (new Date()).getTime(), // epoch
    //   12345,
    // );

    // let dd = dh.datastore._zrangebyscore(
    //   dh.datastore.paths.user_response_updated,
    //   'test',
    //   0,
    //   1555967647178
    // ).then((r) => {
    //   res.status(200).send(JSON.stringify(r));
    // })

  });
}
