import logger from 'common/logger';

import { questionHandlerMap } from 'server/handler/questionHandlers';
import { fbtrEvents, fbtr } from 'common/fbtr';

function objToArray(obj) {
  var result = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      result.push(obj[prop]);
    }
  }
  return result;
}

function escape(field) {
  if (field == undefined) {
    return '';
  }
  return '"' + String(field).replace(/\"/g, '""') + '"';
}

function genCSVBuilder(dh, flatattr) {
  return dh.getQuestionFlow()
    .then((question_flow) => {
      let header = ['uid'];
      question_flow.questions.forEach((question, index) => {
        let needNoAnswer = questionHandlerMap[question.type](0, question, {})[1];
        if (!needNoAnswer) {
          header.push(`q${index}`);
          header.push(`payload${index}`);
          header.push(`timeofmessage${index}`);
        }
      });
      flatattr.push(header);
      return header;
    })
    .then((header) => {
      return (key, user_resps) => {
        let row = (new Array(header.length)).map(() => { return ''; });
        row[0] = key;
        user_resps.forEach((resp) => {
          let index = header.indexOf(`q${resp.qid}`);
          row[index] = resp.qid;
          row[index+1] = resp.payload;
          row[index+2] = resp.timeOfMessage;
        });
        flatattr.push(row);
      };
    });
}

function genExportBuilder(dh, csv) {
  return dh.getQuestionFlow()
    .then((question_flow) => {
      let col_names = [];  // columns
      let headers = ['uid', 'first_name', 'last_name'];
      question_flow.questions.forEach((question, _idx) => {
        if (question.export) {
          headers.push(question.export.colName);
          col_names.push(question.export.colName);
        }
      });

      csv.push(headers);
      return col_names;
    })
    .then((col_names) => {
      return (key, user_resps, profile) => {
        let row = [];
        let col_count = 0;
        row.push(key);
        if (profile && profile.first_name && profile.last_name) {
          row.push(profile.first_name);
          row.push(profile.last_name);
        } else {
          row.push('null');
        }

        col_names.forEach((col_name) => {
          let q_responses = user_resps.filter(response => (response.colName == col_name));

          if (q_responses.length == 0) {
            row.push('');
          } else {
            let latest_response = q_responses.reduce((latest, current) => {
              return (
                (current.timeOfMessage > latest.timeOfMessage) ?
                current:
                latest
              );
            });

            row.push(latest_response.payload);
            col_count++;
          }
        });

        if (col_count > 0) {
          csv.push(row);
        }
      };
    });
}

function loadOneUserResponse(dh, key, csv_builder) {
  return Promise.all([
    dh.getUserResponse(key),
    dh.getUserProfile(key),
  ]).then(([user_resp, profile]) => {
    let user_profile = (profile ? profile.userProfile : null);
    csv_builder(key, user_resp.userResponses, user_profile);
  });
}

function loadResponsesBetween(dh, csv_builder, start_date, end_date) {
  return dh.getResponedUsersBetween(start_date, end_date)
    .then((user_ids) => {
      return new Promise((resolve, _reject) => {
        function _load(keys, callback) {
          if (keys.length <= 0) {
            callback();
          } else {
            let key = keys[0];
            let rest_keys = keys.splice(1);
            loadOneUserResponse(dh, key, csv_builder)
              .then(() => {
                _load(rest_keys, callback);
              });
          }
        }
        _load(user_ids, resolve);
      });
    });
}

function loadAllResponsesForExport(dh, csv_builder) {
  return dh.scanUserResponses()
    .then((keys) => {
      return new Promise((resolve, _reject) => {
        function _load(keys, callback) {
          if (keys.length <= 0) {
            callback();
          } else {
            let key = keys[0];
            let rest_keys = keys.splice(1);
            loadOneUserResponse(dh, key, csv_builder)
              .then(() => {
                _load(rest_keys, callback);
              });
          }
        }
        _load(keys, resolve);
      });
    });
}


export function init(app, dh) {
  app.get('/download_leads', (req, res) => {
    let flatattr = [];
    genCSVBuilder(dh, flatattr)
      .then((csv_builder) => {
        return loadAllResponsesForExport(dh, csv_builder);
      })
      .then(() => {
        res.csv(flatattr);
      })
      .catch((err) => {
        logger.error(`error while generating flat responses for export: ${JSON.stringify(err)}`);
        res.sendStatus(500);
      });
    fbtr(fbtrEvents.LEADGENBOT_EXPORT_LEAD);
  });

  app.get('/data_export', (req, res) => {
    let csv_rows = [];
    let {startDate: start_date, endDate: end_date} = req.query;

    genExportBuilder(dh, csv_rows)
      .then((export_builder) => {
        return loadResponsesBetween(dh, export_builder, start_date, end_date);
      })
      .then(() => {
        res.setHeader('Content-disposition', 'attachment; filename=export_leads.csv');
        res.setHeader('Content-Type', 'text/csv');

        var body = '\uFEFF'; // prepend BOM to make Excel happy

        csv_rows.forEach(function(item) {
          if (!(item instanceof Array)) { item = objToArray(item); }
          body += item.map(escape).join(',') + '\r\n';
        });

        res.send(body);
      })
      .catch((err) => {
        logger.error(`error while generating flat responses for export: ${err}`);
        res.sendStatus(500);
      });
    fbtr(fbtrEvents.LEADGENBOT_EXPORT_LEAD);
  });

  app.get('/lead_scan_keys', (req, res) => {
    dh.scanUserResponses()
      .then((keys) => {
        res.status(200).send(keys);
      });
  });

  app.get('/lead_with_key', (req, res) => {
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

  app.delete('/lead_with_key', (req, res) => {
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
