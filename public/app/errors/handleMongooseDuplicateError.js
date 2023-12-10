"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleMongooseDuplicateError = (err) => {
    const statusCode = 400;
    const match = err.message.match(/"([^"]*)"/);
    const extractedMessage = match && match[1];
    const errorSources = [{
            path: '',
            message: `${extractedMessage} already exists`,
        }];
    return {
        statusCode,
        message: 'Mongoose Duplicate Error',
        errorSources,
    };
};
exports.default = handleMongooseDuplicateError;
