import express from 'express';
import ExpressHelper from 'server/helper/ExpressHelper';
import http from 'http';
import logger from 'common/logger';
import localtunnel from 'localtunnel';

const port = parseInt(process.env.PORT || 5000, 10);
const localtunnel_service_port = port + 1;

if (process.env.TUNNEL_METHOD === 'localtunnel') {
  localtunnel(port, (_err, tunnel) => {
    logger.info(`Will tunneling local server on port ${port} through: ${tunnel.url}`);
    const app = ExpressHelper(express(), process.cwd(), logger);
    const server = http.createServer(app);
    server.listen(localtunnel_service_port, (_err) => {
      app.get('/localtunnel', (_req, res) => {
        res.status(200).send(tunnel.url);
      });
      logger.info(`Localtunnel service started at port ${localtunnel_service_port}`);
    });
  });
} else {
  logger.info(`TUNNEL_METHOD=${process.env.TUNNEL_METHOD}, skip start localtunnel local server.`);
}
