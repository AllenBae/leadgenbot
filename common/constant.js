const GRAPH_API_VERSION = 'v3.0';
const FBSDK_VERSION = 'v3.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
const HEROKU_APP_URL =
  process.env.HEROKU_APP_NAME ?
    `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`
    : process.env.HEROKU_LOCAL_URL;
const WEBHOOK_PATH = '/webhook';
const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const FB_APP_ACCESS_TOKEN = `${FB_APP_ID}|${process.env.FB_APP_SECRET}`;
const WEBHOOK_VERIFY_TOKEN = 'TEMPLATE_BOT';
const LOCAL_FILE_STORE_PATH = `${process.cwd()}/var/data`;
const REDISCLOUD_URL = `${process.env.REDIS_URL || ''}`;

// for store/bot/config.js
const ACCESS_TOKEN_TTL = 30 * 60; // 30 minutes of seconds
const ACCESS_TOKEN_REAP_INTERVAL = 60 * 1000; // 1 min

const PAGE_ACCESS_TOKEN_KEY =
  process.env.PAGE_ACCESS_TOKEN_KEY ? process.env.PAGE_ACCESS_TOKEN_KEY : 'page_access_token';

export default {
  ACCESS_TOKEN_REAP_INTERVAL,
  ACCESS_TOKEN_TTL,
  FB_APP_ACCESS_TOKEN,
  FB_APP_ID,
  FB_APP_SECRET,
  FBSDK_VERSION,
  GRAPH_API_VERSION,
  GRAPH_BASE_URL,
  HEROKU_APP_URL,
  WEBHOOK_PATH,
  LOCAL_FILE_STORE_PATH,
  PAGE_ACCESS_TOKEN_KEY,
  REDISCLOUD_URL,
  WEBHOOK_VERIFY_TOKEN,
};
