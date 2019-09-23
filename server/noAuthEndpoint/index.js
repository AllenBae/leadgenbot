import {init as managerInit} from './manager';
import {init as webhookInit} from './webhook';
import {init as fbuserAuthInit} from './fbuserAuth';
import {init as devManagerInit} from './devManager';
import {init as reminderInit} from './reminder';

export default [
  managerInit,
  webhookInit,
  fbuserAuthInit,
  devManagerInit,
  reminderInit,
];
