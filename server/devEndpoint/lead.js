export function init(app, dh) {
  app.get('/dev/lead_scan_keys', (req, res) => {
    dh.scanUserResponses()
      .then((keys) => {
        res.status(200).send(keys);
      });
  });

  app.get('/dev/lead_with_key', (req, res) => {
    Promise.all([
      dh.getUserResponse(req.query.key),
      dh.getUserProgress(req.query.key),
    ])
    .then(([user_resp_mgr, user_prog_mgr]) => {
      res.status(200).send({
        progress: user_prog_mgr.userProgress,
        response: user_resp_mgr.userResponses
      });
    });
  });

  app.post('/dev/lead_with_key', (req, res) => {
    let {progress, response} = req.body;
    dh.getUserResponse(req.query.key)
      .then((user_resp_mgr) => {
        user_resp_mgr.userResponses = response;
        return user_resp_mgr.save();
      })
      .then(() => {
        return dh.getUserProgress(req.query.key);
      })
      .then((user_progress_mgr) => {
        user_progress_mgr.userProgress = progress;
        return user_progress_mgr.save();
      })
      .then(() => {
        res.sendStatus(200);
      });
  });

  app.delete('/dev/lead_with_key', (req, res) => {
    dh.getUserResponse(req.query.key)
      .then((user_resp_mgr) => {
        return user_resp_mgr.del();
      })
      .then(() => {
        return dh.getUserProgress(req.query.key);
      })
      .then((user_progress_mgr) => {
        return user_progress_mgr.del();
      })
      .then(() => {
        res.sendStatus(200);
      });
  });
}
