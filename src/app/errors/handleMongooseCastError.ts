import mongoose from 'mongoose';
import { TErrorSources, TGenericErrorResponse } from '../interface/error';

const handleMongooseCastError = (
  err: mongoose.Error.CastError,
): TGenericErrorResponse => {
  const statusCode = 400;

  const errorSources: TErrorSources = [{
    path: err.path,
    message: err.message,
  }]

  return {
    statusCode,
    message: 'Mongoose Cast Error',
    errorSources,
  };
};

export default handleMongooseCastError;
