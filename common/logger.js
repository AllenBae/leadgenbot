import winston from 'winston';

var logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV == 'dev' || process.env.NODE_ENV == 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
} else if (process.env.NODE_ENV == 'test') {
  logger.add(new winston.transports.File({
    filename: `${process.cwd()}/var/log/all.log`,
  }));  
}

export default logger;
