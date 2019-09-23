import constant from 'common/constant';

export function init(app, dh) {
  app.get('/dev/server_config', (req, res) => {
    res.status(200).send({
      constant: constant,
      datastore_paths: dh.datastore.paths,
    });
  });
}
