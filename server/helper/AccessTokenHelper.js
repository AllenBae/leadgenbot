export default function(datahandler) {
  return (req, res, next) => {
    const at = req.query.access_token || req.body.access_token || req.params.access_token;
    if (at && datahandler.botConfig.checkAccessToken(at)) {
      next();
    } else {
      res.status(401).send('Permission denied.');
    }
  };
}
