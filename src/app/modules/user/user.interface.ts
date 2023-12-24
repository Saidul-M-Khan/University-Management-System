/* eslint-disable no-unused-vars */
import { Model } from "mongoose";
import { USER_ROLE } from "./user.constant";

export interface IUser {
  id: string;
  password: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  role: 'admin' | 'student' | 'faculty';
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
};

export type TUserRole = keyof typeof USER_ROLE;

export interface UserModel extends Model<IUser>{
  isUserExistsByCustomId(id: string): Promise<IUser>;
  isUserDeletedByCustomId(payload: IUser): Promise<boolean>;
  userStatusByCustomId(payload: IUser): Promise<string>;
  isPasswordMatched(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}