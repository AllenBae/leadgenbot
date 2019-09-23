import fs from 'fs';
import path from 'path';

import DataStore from './DataStore';

export default class LocalFileDataStore extends DataStore {

  constructor() {
    super();
  }

  formatFilePath(path, key) {
    return `${path}_${key}.json`;
  }

  _zadd(path, key, score, id) {
    // WARNING: THIS IS PRONE TO HAVE RACING CONDIITON
    // BECAUSE OF SIMPLE FILE READ/WRITE
    // IT'S OK FOR LOCAL TESTING BUT DEFINITLY NOT OK FOR PRODUCTION
    fs.readFile(this.formatFilePath(path, key), (err, data) => {
      let values;
      if (err) {
        values = {};
      } else {
        values = JSON.parse(data);
      }
      values[id] = score;

      return new Promise((resolve, reject) => {
        fs.writeFile(this.formatFilePath(path, key), JSON.stringify(values), (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  _zrange(path, key, _start, _end) {
    // local data store will ignore start & end
    return new Promise((resolve, _reject) => {
      fs.readFile(this.formatFilePath(path, key), (err, data) => {
        if (err) {
          resolve([]);  // return empty array when doesn't exists or err
        } else {
          resolve(Object.keys(JSON.parse(data)).slice(_start, _end));
        }
      });
    });
  }

  _zrangebyscore(path, key, _min, _max) {
    // local data store will ignore start & end
    return new Promise((resolve, _reject) => {
      fs.readFile(this.formatFilePath(path, key), (err, data) => {
        if (err) {
          resolve([]);  // return empty array when doesn't exists or err
        } else {
          let last_resp_times = JSON.parse(data);
          let result = Object.entries(last_resp_times).filter(
            (v) => (v[1] > _min && v[1] < _max)
          );

          resolve(result.map(([k, _v]) => k));
        }
      });
    });
  }

  // Override
  _read(path, key) {
    return new Promise((resolve, reject) => {
      fs.readFile(this.formatFilePath(path, key), (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // Override
  _write(path, key, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.formatFilePath(path, key), data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  _scan(the_path) {
    let dir = path.dirname(the_path);
    let prefix = path.basename(the_path);
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, files) => {
        if (err) {
          reject(err);
        } else {
          let keys = [];
          files.map((file) => {
            let re = new RegExp(prefix + '_([^_]+).json', 'g');
            let m = re.exec(file);
            if (m) {
              keys.push(m[1]);
            }
          });
          resolve(keys);
        }
      });
    });
  }

  _del(path, key) {
    return new Promise((resolve, reject) => {
      fs.unlink(this.formatFilePath(path, key), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
