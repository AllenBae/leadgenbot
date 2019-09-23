import invariant from 'invariant';

import logger from 'common/logger';
import { fbtrEvents, fbtr } from 'common/fbtr';

export function init(app, dh) {
  app.get('/questions', (req, res) => {
    dh.getQuestionFlow()
      .then((questionFlow) => {
        res.json(questionFlow.questions);
      })
      .catch((err) => {
        logger.info(`Get all questions failed: ${JSON.stringify(err)}`);
        res.sendStatus(500);
      });
  });

  app.post('/questions', (req, res) => {
    invariant(Array.isArray(req.body), '/questions only accepts POST with JSON array. Current is not!');
    dh.getQuestionFlow()
      .then((questionFlow) => {
        questionFlow.questions = req.body;
        return questionFlow.save();
      })
      .then(() => {
        res.sendStatus(200);
      })
      .catch(() => {
        res.sendStatus(500);
      });
    fbtr(fbtrEvents.LEADGENBOT_QUESTIONAIRE_UPDATE);
  });
}
