import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';
import { TUserRole } from '../modules/user/user.interface';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    const secret = config.jwt_access_secret as string;
    console.log(token);

    // check if the token sent from client
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    // check if the token is valid
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      console.log(decoded);
      req.user = decoded as JwtPayload;

      // check user role
      const roleFromToken = (decoded as JwtPayload)?.role
      if(requiredRoles && !requiredRoles.includes(roleFromToken)){
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      
      next();
    });
  });
};

export default auth;
