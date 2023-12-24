"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleMongooseCastError = (err) => {
    const statusCode = 400;
    const errorSources = [{
            path: err.path,
            message: err.message,
        }];
    return {
        statusCode,
        message: 'Mongoose Cast Error',
        errorSources,
    };
};
exports.default = handleMongooseCastError;
