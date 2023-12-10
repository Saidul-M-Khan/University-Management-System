import { TErrorSources, TGenericErrorResponse } from '../interface/error';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleMongooseDuplicateError = (err: any): TGenericErrorResponse => {

    const statusCode = 400;

    const match = err.message.match(/"([^"]*)"/)
    const extractedMessage = match && match[1];

  const errorSources: TErrorSources = [{
    path: '',
    message: `${extractedMessage} already exists`,
  }]

  return {
    statusCode,
    message: 'Mongoose Duplicate Error',
    errorSources,
  };

}

export default handleMongooseDuplicateError;