export default function(expressapp, cwd, logger) {
  let dirname = cwd;

  function get_caller_info() {
    return ((new Error().stack).split('at ')[3]).trim();
  }

  expressapp.secureCheckMiddlewareForFollowingRoutes = null;

  expressapp.enableSecureCheckForFollowingRoutes = (middleware) => {
    expressapp.secureCheckMiddlewareForFollowingRoutes = middleware;
  };

  expressapp.disableSecureCheckForFollowingRoutes = () => {
    expressapp.secureCheckMiddlewareForFollowingRoutes = null;
  };

  [
    ['get', expressapp.get],
    ['post', expressapp.post],
    ['put', expressapp.put],
    ['delete', expressapp.delete],
  ].map(([verb, expressFunc]) => {
    expressapp[verb] = (path, ...args) => {
      let caller_info = get_caller_info().replace(dirname, '').replace('file://', '');
      if (expressapp.secureCheckMiddlewareForFollowingRoutes) {
        if (!caller_info.includes('node_modules')) {
          logger.info(
            `endpoint {${verb.toUpperCase()}, ${path}} is defined ` +
            `by ${caller_info} with secure check.`
          );
        }
        expressFunc.apply(
          expressapp, [path, expressapp.secureCheckMiddlewareForFollowingRoutes, ...args]);
      } else {
        if (!caller_info.includes('node_modules')) {
          logger.info(`endpoint {${verb.toUpperCase()}, ${path}} is defined by ${caller_info}`);
        }
        expressFunc.apply(expressapp, [path, ...args]);
      }
    };
  });

  return expressapp;
}
