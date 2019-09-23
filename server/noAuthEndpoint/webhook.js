import logger from 'common/logger';
import constant from 'common/constant';
import fbrequest from 'common/fbrequest';
import {sendQuestion} from 'server/helper/MessengerHelper';
import {responseHandlerMap} from 'server/handler/responseHandlers';
import {fbtrEvents, fbtr} from 'common/fbtr';
import { cfbtr } from 'common/cfbtr';

function receivedMessage(event, dh) {
  let senderID = event.sender.id;
  let recipientID = event.recipient.id;
  let timeOfMessage = event.timestamp;
  let message = event.message;

  logger.info(
    `Received message for user ${senderID} and page ${recipientID} at ${timeOfMessage} ` +
    `with message: ${JSON.stringify(message)}`
  );

  Promise.all([
    dh.getQuestionFlow(),
    dh.getUserProgress(senderID),
    dh.getUserResponse(senderID),
    dh.getUserProfile(senderID),
    dh.getAccessToken(),
  ])
  .then(([questionFlow, userProgress, userResponse, userProfile, accessToken]) => {
    if (message.text === '!!!reset') {
      userProgress.update({
        expectRespType: 'genesis',
        nextQid: 0,
        stopAtQid: 0,
      });
      return;
    }

    var page_access_token = accessToken.get(constant.PAGE_ACCESS_TOKEN_KEY);

    logger.info(`user ${userProgress.userID} at progress ${JSON.stringify(userProgress.userProgress)}`);

    let campaign_payload = dh.botConfig.getCampaignPayload();
    let target_app_id = dh.botConfig.getTargetAppID();

    if (campaign_payload && target_app_id) { // if handover is configured
      // if handover is configured
      // we handover this recipient to target app when
      // 1. user isn't in the middle of a lead verification (e.g.
      //  carry on from previous conversation before bot was installed,
      //  user keep talking to the page after lead has been done), AND
      // 2. user isn't click "Get Started" from ADS and carry specific payload

      let from_specific_source = !!(
        event.postback
        && event.postback.referral
        && event.postback.referral.source == 'ADS'
        // && (
        //   event.postback.payload == campaign_payload
        //   || event.postback.referral.ref == campaign_payload
        //   )
        // there is a bug in mobile currently that ref param is missing on mobile
        // TODO
      );

      logger.info(
        'POSTBACK: ' +
        `${JSON.stringify(event.postback)}`
      );

      logger.info(`User in progress? ${userProgress.isInProgress()}`);
      logger.info(`from_specific_source? ${from_specific_source}`);

      if (!userProgress.isInProgress() && !from_specific_source) {
        logger.info(`Handover to App ID ${target_app_id}`);
        fbrequest.post({
          uri: `${constant.GRAPH_BASE_URL}/me/pass_thread_control`,
          json: {
            access_token: page_access_token,
            target_app_id: target_app_id,
            recipient: {id: senderID},
          },
        });

        return;
      }

      if (from_specific_source) {
        logger.info('Taking Thread Control');
        fbrequest.post({
          uri: `${constant.GRAPH_BASE_URL}/me/take_thread_control`,
          json: {
            access_token: page_access_token,
            recipient: {id: senderID},
          },
        });

        // TODO
        logger.info('And clearing progress');
        userProgress.update({
          expectRespType: 'genesis',
          nextQid: 0,
          stopAtQid: 0,
        });
      }
    }

    if (!userProfile.isProfileFetched()) {
      logger.info(`Fetching user profile for ${userProfile.userID}`);
      fbrequest.get({
        uri: `${constant.GRAPH_BASE_URL}/${userProfile.userID}`,
        qs: {
          'access_token': page_access_token,
        },
      })
      .then((profile) => {
        logger.info(`user profile fetched ${JSON.stringify(profile)}`);
        userProfile.update(profile);
      })
      .catch((err) => {
        logger.error(`Profile fetch failed with ${err}`);
      });
    }

    let {expectRespType, stopAtQid, nextQid, confirmationQid} = userProgress.userProgress;
    expectRespType = expectRespType || 'genesis';
    nextQid = nextQid || 0;
    responseHandlerMap[expectRespType](message, event, questionFlow, userProgress, userResponse)
      .then(({nextQid, isGoingBack}) => {
        //before going to next question, check if this question requires event to be fired
        let currentQuestion = questionFlow.findQuestionWithQid(stopAtQid);

        if (currentQuestion.event?currentQuestion.event.endFire:false) {
          logger.info(`Trigger reply custom event: ${currentQuestion.event.name}.`);
          cfbtr(currentQuestion, recipientID, senderID,
            {
              trigger:'END',
              payload:JSON.stringify(message)
            }
          );
        }

        let currentConfirmationId = null;

        if (currentQuestion.type == 'confirmation' && isGoingBack) {
          currentConfirmationId = stopAtQid;
        } else if (confirmationQid) {
          nextQid = confirmationQid;
        }

        // we can hanlde this response, go to next question
        return sendQuestion(recipientID, userProfile, nextQid, questionFlow, userResponse)
          .then(([stopAtQid, nextExpectRespType]) => {
            userProgress.update({
              expectRespType: nextExpectRespType,
              nextQid: nextQid,
              stopAtQid: stopAtQid,
              confirmationQid: currentConfirmationId,
            });
          });
      })
      .catch((err) => {
        logger.error(`Oops, can not handle user response because ${err}`);
        logger.info('fall back to re-send last question.');
        // can not handle this response, repeat last question
        sendQuestion(recipientID, userProfile, nextQid, questionFlow, userResponse)
          .then(([stopAtQid, nextExpectRespType]) => {
            userProgress.update({
              expectRespType: nextExpectRespType,
              nextQid: nextQid,
              stopAtQid: stopAtQid,
            });
          });
      });
  });
}

function parseReferral(event, _dh) {
  let senderID = event.sender.id;
  let referral_ref = event.postback.referral.ref;
  let referral_source = event.postback.referral.source;

  logger.info(
    `Developer implementation of referral data: ${JSON.stringify(event.postback.referral)}`);
  return;
}

export function init(app, dh) {
  app.get(constant.WEBHOOK_PATH, (req, res) => {
    if (req.query['hub.verify_token'] === 'TEMPLATE_BOT') {
      res.send(req.query['hub.challenge']);
    } else {
      res.send('Error, wrong validation token');
    }
  });

  app.post(constant.WEBHOOK_PATH, (req, res) => {
    let data = req.body;
    if (data.object == 'page') {
      data.entry.forEach((pageEntry) => {
        pageEntry.messaging.forEach((messagingEvent) => {
          if (messagingEvent.message) {
            receivedMessage(messagingEvent, dh);
          } else if (messagingEvent.postback && messagingEvent.postback.referral) {
            parseReferral(messagingEvent, dh);
          } else if (messagingEvent.postback) {
            receivedMessage(Object.assign(messagingEvent, {
              message: messagingEvent.postback.payload,
            }), dh);
          } else {
            logger.info(
              `Webhook received unsupported messageEvent: ${JSON.stringify(messagingEvent)}`);
          }
          fbtr(fbtrEvents.LEADGENBOT_MSG_RECEIVED, messagingEvent.sender.id);
        });
      });
      res.sendStatus(200);
    }
  });
}
