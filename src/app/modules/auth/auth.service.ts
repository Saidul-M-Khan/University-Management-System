import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';

const loginUser = async (payload: TLoginUser) => {
  // check if the user exists
  const user = await User.isUserExistsByCustomId(payload.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid User ID');
  }

  // check if the user is already deleted
  const isDeleted = await User.isUserDeletedByCustomId(user);
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted');
  }

  // check if the user is blocked
  const userStatus = await User.userStatusByCustomId(user);
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
  }

  // checking if the password is correct
  const isPasswordMatched = await User.isPasswordMatched(
    payload?.password,
    user?.password,
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password not matched');
  }

  // create token and send to the client
  const jwtPayload = { userId: user.id, role: user.role };
  const jwtSecret = config.jwt_access_secret as string;
  const jwtConfig = { expiresIn: '10d' };

  const accessToken = jwt.sign(jwtPayload, jwtSecret, jwtConfig);

  return {
    accessToken,
    needsPasswordChange: user?.needsPasswordChange
  };
};

export const AuthServices = {
  loginUser,
};
