
const { LoggingWinston } = require('@google-cloud/logging-winston');
const winston = require('winston');
const {
    APPLICATION_API_LOG_LEVEL, APPLICATION_API_LOG_TRANSPORT, APPLICATION_API_LOGGER_NAME, MAX_LOG_BODY_LENGTH = 1000,
} = process.env;


const appStackDriver = new LoggingWinston({
    logName: `${APPLICATION_API_LOGGER_NAME || 'botfront-api_log_app'}`,
    level: APPLICATION_API_LOG_LEVEL,
});


const logsTransport = [];
if (!!APPLICATION_API_LOG_TRANSPORT) {
    if (APPLICATION_API_LOG_TRANSPORT.includes('console'))  logsTransport.push(new winston.transports.Console({level:  APPLICATION_API_LOG_LEVEL}));
    if (APPLICATION_API_LOG_TRANSPORT.includes('stackdriver'))  logsTransport.push(appStackDriver);
} else {
    logsTransport.push(new winston.transports.Console({level:  APPLICATION_API_LOG_LEVEL}))
}



const checkBodyLength = (meta, key) => (meta
    && meta[key]
    && meta[key].body
    && JSON.stringify(meta[key].body).length > MAX_LOG_BODY_LENGTH);


const customFormat = winston.format.printf((arg) => {
    const {timestamp, level, message, meta} = arg
    const cleanedMeta = meta
    if (checkBodyLength(cleanedMeta, 'res')){
        cleanedMeta.res.body = 'Body is too large.'
    }
    if (checkBodyLength(cleanedMeta, 'req')){
        cleanedMeta.req.body = 'Body is too large.'
    }
    return `${timestamp} [${level}]: ${message}  res: ${JSON.stringify(cleanedMeta.res)}  req: ${JSON.stringify(cleanedMeta.req)} `
});


module.exports = { logsTransport, customFormat };