import FBGraphHelper from 'server/helper/FBGraphHelper';
import constant from 'common/constant';
import fbrequest from 'common/fbrequest';
import logger from 'common/logger';
import { fbtrEvents, fbtr } from 'common/fbtr';

export function init(app, dh) {
  app.post('/access_token', (req, res) => {
    let pageID = req.body.page_id;

    // We need to get a long-lived user access token before getting a long-lived
    // page access token.
    fbrequest.get({
      uri: `${constant.GRAPH_BASE_URL}/oauth/access_token`,
      qs: {
        grant_type: 'fb_exchange_token',
        client_id: constant.FB_APP_ID,
        client_secret: constant.FB_APP_SECRET,
        fb_exchange_token: req.body.access_token,
      }
    })
    .then((bodyobj) => {
      let user_access_token = bodyobj.access_token;
      return fbrequest.get({
        uri: `${constant.GRAPH_BASE_URL}/${pageID}`,
        qs: {
          fields: 'access_token',
          access_token: user_access_token,
        }
      });
    })
    .then((bodyobj) => {
      let page_access_token = bodyobj.access_token;
      dh.getAccessToken()
        .then((access_token_mgr) => {
          access_token_mgr.update({ [constant.PAGE_ACCESS_TOKEN_KEY]: page_access_token })
            .then(() => {
              res.sendStatus(200);
            })
            .catch(() => {
              res.sendStatus(400);
            });
        });
    })
    .catch((err) => {
      logger.error(`Error while requesting to Facebook API, ${JSON.stringify(err)}`);
      res.status(400).send('Error while requesting to Facebook API.');
    });
  });

  app.get('/dropbox/app_key', (_req, res) => {
    const appKey = dh.botConfig.getDropboxAppKey();
    if (appKey) {
      res.status(200).send(appKey);
    } else {
      res.sendStatus(400);
    }
  });

  app.post('/dropbox/app_key', (req, res) => {
    const appKey = req.body.key;
    if (appKey && appKey.length > 0) {
      dh.botConfig
        .setDropboxAppKey(appKey)
        .save()
        .then(() => {
          res.sendStatus(200);
        })
        .catch((err) => {
          logger.error(`Oops, failed when save dropbox_app_key because: ${JSON.stringify(err)}`);
          res.sendStatus(400);
        });
    } else {
      logger.error(
        'Oops, failed when save dropbox_app_key because appKey is not there or ' +
        `empty: ${JSON.stringify(appKey)}`
      );
      res.sendStatus(400);
    }
  });

  app.get('/subscribe_page', (_req, res) => {
    const page = dh.botConfig.getSubscribedPage();
    if (page && page.id) {
      res.json(page);
    } else {
      res.sendStatus(400);
    }
  });

  app.post('/subscribe_page', (req, res) => {
    FBGraphHelper.subscribeWebhooks(req.body.page)
      .then(() => {
        return dh.botConfig
          .setSubscribedPage(req.body.page)
          .save();
      })
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        logger.error(
          `Oops, failed when subscribe to page ${JSON.stringify(req.body.page)} ` +
          `because ${JSON.stringify(err)}`
        );
        res.sendStatus(400);
      });
    fbtr(fbtrEvents.LEADGENBOT_CONNECT_PAGE);
  });

  app.get('/permission', (_req, res) => {
    res.send(Object.keys(dh.botConfig.config.permissions));
  });

  app.post('/permission/del', (req, res) => {
    let email = req.body.email;
    if (email in dh.botConfig.config.permissions) {
      delete dh.botConfig.config.permissions[email];
      dh.botConfig.save()
        .then(() => {
          res.sendStatus(200);
        })
        .catch((err) => {
          logger.error(`Oops, can not del permission for ${email} because ${JSON.stringify(err)}`);
          res.status(400);
        });
    } else {
      res.sendStatus(200);
    }
  });

  app.post('/permission/add', (req, res) => {
    let new_email = req.body.email;
    if (dh.botConfig.config.permissions[new_email]) {
      res.sendStatus(200);
    } else {
      dh.botConfig.config.permissions[new_email] = true;
      dh.botConfig.save()
        .then(() => {
          res.sendStatus(200);
        })
        .catch((err) => {
          logger.error(
            `Oops, can not add permission for ${new_email} because ${JSON.stringify(err)}`);
          res.sendStatus(400);
        });
    }
  });

  app.get('/accesstoken/ping', (_req, res) => {
    res.sendStatus(200);
  });

}
