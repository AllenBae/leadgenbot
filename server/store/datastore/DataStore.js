export default class DataStore {
  constructor() {
    if (this === DataStore) {
      throw new Error('You must instantiate inheritted Datastore class');
    }
  }

  //
  // All methods below needs to be defined in the child class.
  // They are abstractly defined here for signature definition purpose.
  //
  _read(_path, _key) { throw new Error('Undefined'); }
  _write(_path, _key, _data) { throw new Error('Undefined'); }
  _scan(_path) { throw new Error('Undefined'); }
  _del(_path, _key) { throw new Error('Undefined'); }
}
