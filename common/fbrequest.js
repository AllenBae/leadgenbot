import request from 'request-promise';

/* liyuhk: for any request to Facebook Graph API endpoint, failures can be complex
   case 1: can be normal HTTP err, like no connection, or can not resolve domain
   case 2: can be error of incomplete HTTP body
   case 3: can be error of Facebook platform, usually in HTTP we will get 200 OK, but the data is 
           like `{ error: {} }`
   The wrapper in this file helps us to address these with 2 functions: get and post, they are 
   with the same useage of request-promise.
*/

function isObject(obj) {
  // borrow from https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript
  return obj === Object(obj);
}

function fbrequest(resolve, reject, ...args) {
  request(...args)
    .then((body) => {
      let bodyobj = null;
      if (isObject(body)) {
        bodyobj = body;
      } else {
        bodyobj = JSON.parse(body);
      }
      if (bodyobj.error) {
        reject(bodyobj.error);
      } else {
        resolve(bodyobj);
      }
    })
    .catch((err) => {
      reject(err);
    });
}

export default {
  get: (options, ...args) => {
    return new Promise((resolve, reject) => {
      fbrequest(resolve, reject, {method: 'GET', ...options}, ...args);
    });
  },
  post: (options, ...args) => {
    return new Promise((resolve, reject) => {
      fbrequest(resolve, reject, {method: 'POST', ...options}, ...args);
    });
  },
};
