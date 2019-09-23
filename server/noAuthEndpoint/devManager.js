import express from 'express';

import constant from 'common/constant';
import {fbtrEvents, fbtr} from 'common/fbtr';

export function init(app) {
  app.use(express.static('bundle'));
  app.get('/dev/manager', (_req, res) => {
    res.status(200).send(`
  <div id="fb-root"></div>
  <div id="app"></div>
  <script>
  (function() {
    window.leadgenbotconst = window.leadgenbotconst || {};
    window.leadgenbotconst.HEROKU_APP_URL = '${constant.HEROKU_APP_URL}';
    window.leadgenbotconst.FB_APP_ID = '${constant.FB_APP_ID}';
    window.leadgenbotconst.NODE_ENV = '${process.env.NODE_ENV}';
    window.leadgenbotconst.FBSDK_VERSION = '${constant.FBSDK_VERSION}';
    window.leadgenbotconst.DEV_MANAGER = true;
  })();
  </script>
  <script src="/manager-static.js"></script>
  <script src="/manager.js"></script>
    `);
    fbtr(fbtrEvents.LEADGENBOT_LAUNCH_APP);
  });
}
