const functions = require("firebase-functions");

const logLevels = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

const log = (level, message, data = {}) => {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  };

  switch (level) {
    case logLevels.DEBUG:
      functions.logger.debug(message, logEntry);
      break;
    case logLevels.INFO:
      functions.logger.info(message, logEntry);
      break;
    case logLevels.WARN:
      functions.logger.warn(message, logEntry);
      break;
    case logLevels.ERROR:
      functions.logger.error(message, logEntry);
      break;
    default:
      functions.logger.log(message, logEntry);
  }
};

module.exports = {log, logLevels};
